import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ZXingHtml5QrcodeDecoder } from 'html5-qrcode/esm/zxing-html5-qrcode-decoder';
import type { Logger } from 'html5-qrcode/esm/core';

/*
 * Réglages encore utilisés par Html5QrcodeScannerService (vigile).
 */
export const OPTIONS_LECTEUR_QR = {
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  experimentalFeatures: { useBarCodeDetectorIfSupported: true },
  verbose: false,
};

/** Zone analysée : 90 % du plus petit côté de l'image (le cadre affiché reste un repère, pas une limite). */
export const zoneAnalyseQr = (w: number, h: number) => {
  const cote = Math.floor(Math.min(w, h) * 0.9);
  return { width: Math.max(160, cote), height: Math.max(160, cote) };
};

export const CONTRAINTES_VIDEO_QR = (facingMode: 'environment' | 'user'): MediaTrackConstraints => ({
  facingMode: { ideal: facingMode },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
});

/*
 * 16/11 : « rien ne se passe » devant un QR bien cadré. html5-qrcode décodait une copie de l'image À LA TAILLE DU
 * CADRE AFFICHÉ (≈ 170 px CSS dans le cadre de 192 px), pas à celle de la caméra : une image 1920 × 1080 y était
 * réduite d'un facteur 10 en largeur et 5,6 en hauteur (le recadrage `object-fit: cover` faussait en plus le calcul).
 * Un QR qui remplissait le cadre tombait à environ 40 × 70 px, soit moins de 2 px par module : jamais lisible.
 * Le lecteur gère désormais lui-même la caméra et lit le carré visible à pleine résolution :
 * - détecteur NATIF du navigateur (BarcodeDetector, Android, ChromeOS, macOS) s'il déclare lire les QR codes ;
 * - sinon le décodeur ZXing fourni par html5-qrcode, sur le carré central.
 * Mesuré le même jour (badge élève signé, ≈ 45 modules, image floue et bruitée) : ZXing réussit ou échoue selon la
 * taille des modules en pixels (même image : lue à 720 et 360 px, jamais à 540 ou 800). Chaque lecture essaie donc
 * 720 px puis une seconde taille qui change à chaque tour : un QR proche ou lointain finit lu en quelques tours.
 */
const ECHELLE_PRINCIPALE = 720;
const ECHELLES_ZXING = [1080, 540, 900, 360, 640, 450];
const PAUSE_ENTRE_LECTURES_MS = 80;

type Lecteur = (video: HTMLVideoElement) => Promise<string | null>;

interface DetecteurNatif { detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>; }
interface ConstructeurDetecteurNatif {
  new (options: { formats: string[] }): DetecteurNatif;
  getSupportedFormats(): Promise<string[]>;
}

const journalMuet: Logger = { log: () => {}, warn: () => {}, logError: () => {}, logErrors: () => {} };

function lecteurZxing(): Lecteur {
  const decodeur = new ZXingHtml5QrcodeDecoder([Html5QrcodeSupportedFormats.QR_CODE], false, journalMuet);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let tour = 0;
  const essayer = async (video: HTMLVideoElement, cote: number, cible: number) => {
    if (!ctx) return null;
    if (canvas.width !== cible) { canvas.width = cible; canvas.height = cible; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, (video.videoWidth - cote) / 2, (video.videoHeight - cote) / 2, cote, cote, 0, 0, cible, cible);
    try { return (await decodeur.decodeAsync(canvas)).text; } catch { return null; }
  };
  return async (video) => {
    const { videoWidth: vw, videoHeight: vh } = video;
    if (!ctx || !vw || !vh) return null;
    // Carré central : exactement ce que montre le cadre (vidéo en `object-fit: cover`)
    const cote = Math.min(vw, vh);
    const echelle = ECHELLES_ZXING[tour++ % ECHELLES_ZXING.length];
    const tailles = [...new Set([ECHELLE_PRINCIPALE, echelle].map(t => Math.min(t, cote)))];
    for (const cible of tailles) {
      const texte = await essayer(video, cote, cible);
      if (texte) return texte;
    }
    return null;
  };
}

async function creerLecteur(): Promise<Lecteur> {
  const Natif = (window as unknown as { BarcodeDetector?: ConstructeurDetecteurNatif }).BarcodeDetector;
  if (Natif) {
    try {
      // Certains navigateurs (Chrome sous Windows ou Linux) exposent l'API sans savoir lire aucun format
      if ((await Natif.getSupportedFormats()).includes('qr_code')) {
        const detecteur = new Natif({ formats: ['qr_code'] });
        const secours = lecteurZxing();
        return async (video) => {
          try {
            const codes = await detecteur.detect(video);
            return codes[0]?.rawValue ?? null;
          } catch {
            return secours(video);
          }
        };
      }
    } catch { /* détecteur natif inutilisable : ZXing */ }
  }
  return lecteurZxing();
}

function messageErreurCamera(err: unknown): string {
  const nom = (err as { name?: string } | null)?.name;
  if (nom === 'NotAllowedError' || nom === 'SecurityError') return 'Accès à la caméra refusé. Autorisez la caméra pour ce site, puis rouvrez le scanner.';
  if (nom === 'NotFoundError' || nom === 'OverconstrainedError') return 'Aucune caméra trouvée sur cet appareil.';
  if (nom === 'NotReadableError') return 'La caméra est déjà utilisée par une autre application.';
  return 'Impossible d\'ouvrir la caméra.';
}

/**
 * Capacités et réglages de caméra hors du type DOM standard (zoom, mise au point…), exposés par Chrome/Android.
 */
type CapacitesCamera = MediaTrackCapabilities & {
  zoom?: { min?: number; max?: number };
  focusMode?: string[];
  exposureMode?: string[];
  whiteBalanceMode?: string[];
};
type ReglagesCamera = MediaTrackConstraintSet & { zoom?: number; focusMode?: string; exposureMode?: string; whiteBalanceMode?: string };

const capacites = (piste: MediaStreamTrack): CapacitesCamera =>
  (typeof piste.getCapabilities === 'function' ? piste.getCapabilities() : {}) as CapacitesCamera;
const appliquer = (piste: MediaStreamTrack, reglages: ReglagesCamera) => piste.applyConstraints({ advanced: [reglages] });

export function useQRCameraScanner(onScanComplete: (text: string) => void) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [zoomSupported, setZoomSupported] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.6);
  const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pisteRef = useRef<MediaStreamTrack | null>(null);
  // Le rappel du parent change à chaque rendu : le garder dans une référence évite de rouvrir la caméra à chaque fois
  const rappelRef = useRef(onScanComplete);
  useEffect(() => { rappelRef.current = onScanComplete; }, [onScanComplete]);

  const applyZoom = useCallback(async (val: number) => {
    const piste = pisteRef.current;
    if (!piste) return;
    try {
      const caps = capacites(piste);
      if (caps.zoom) {
        const borne = Math.max(caps.zoom.min ?? 1, Math.min(val, caps.zoom.max ?? 1));
        await appliquer(piste, { zoom: borne });
        setCurrentZoom(borne);
      }
    } catch (e) { console.warn('Zoom non appliqué', e); }
  }, []);

  useEffect(() => {
    let actif = true;
    let flux: MediaStream | null = null;
    let minuteur: number | undefined;

    const couperCamera = () => {
      flux?.getTracks().forEach(t => t.stop());
      flux = null;
      pisteRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const demarrer = async () => {
      setIsScanning(false);
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('La caméra exige une connexion sécurisée (https).');
        return;
      }
      try {
        const [nouveauFlux, lire] = await Promise.all([
          navigator.mediaDevices.getUserMedia({ audio: false, video: CONTRAINTES_VIDEO_QR(facingMode) }),
          creerLecteur(),
        ]);
        if (!actif) { nouveauFlux.getTracks().forEach(t => t.stop()); return; }
        flux = nouveauFlux;
        const video = videoRef.current;
        if (!video) { couperCamera(); return; }
        video.srcObject = flux;
        await video.play().catch(() => { /* lecture automatique : la vidéo est muette, play() échoue rarement */ });
        if (!actif) return;
        setIsScanning(true);

        const piste = flux.getVideoTracks()[0] ?? null;
        pisteRef.current = piste;
        if (piste) {
          try {
            const caps = capacites(piste);
            const reglages: ReglagesCamera = {};
            if (caps.focusMode?.includes('continuous')) reglages.focusMode = 'continuous';
            if (caps.exposureMode?.includes('continuous')) reglages.exposureMode = 'continuous';
            if (caps.whiteBalanceMode?.includes('continuous')) reglages.whiteBalanceMode = 'continuous';
            if (caps.zoom) {
              const min = caps.zoom.min ?? 1;
              const max = caps.zoom.max ?? 1;
              setZoomSupported(true);
              setZoomCaps({ min, max });
              reglages.zoom = Math.max(min, Math.min(1.6, max));
              setCurrentZoom(reglages.zoom);
            } else {
              setZoomSupported(false);
              setZoomCaps(null);
            }
            if (Object.keys(reglages).length > 0) await appliquer(piste, reglages);
          } catch (e) { console.warn('Réglages caméra non appliqués', e); }
        }

        const boucle = async () => {
          if (!actif) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2) {
            const texte = await lire(v).catch(() => null);
            if (!actif) return;
            if (texte) {
              actif = false;
              couperCamera();
              rappelRef.current(texte);
              return;
            }
          }
          minuteur = window.setTimeout(() => { void boucle(); }, PAUSE_ENTRE_LECTURES_MS);
        };
        void boucle();
      } catch (err) {
        if (actif) { console.error(err); setError(messageErreurCamera(err)); }
      }
    };
    void demarrer();

    return () => {
      actif = false;
      window.clearTimeout(minuteur);
      couperCamera();
    };
  }, [facingMode]);

  return { videoRef, error, isScanning, facingMode, setFacingMode, zoomSupported, currentZoom, zoomCaps, applyZoom };
}
