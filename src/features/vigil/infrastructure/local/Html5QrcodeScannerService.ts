import { Html5Qrcode } from 'html5-qrcode';
import { IQrScannerService } from '../../domain/IQrScannerService';
import { CONTRAINTES_VIDEO_QR, OPTIONS_LECTEUR_QR, zoneAnalyseQr } from '@/shared/components/useQRCameraScanner';

/**
 * Html5QrcodeScannerService
 * Concrete implementation of IQrScannerService using the html5-qrcode library.
 */
export class Html5QrcodeScannerService implements IQrScannerService {
  private html5QrCode: Html5Qrcode | null = null;
  private activeElementId: string | null = null;
  private currentOp: Promise<void> = Promise.resolve();

  async start(
    elementId: string,
    onSuccess: (decodedText: string) => void,
    onFailure?: (errorMessage: string) => void,
    facingMode: 'user' | 'environment' = 'environment'
  ): Promise<void> {
    // Chain onto the operation promise queue to ensure strict sequential execution
    this.currentOp = this.currentOp.then(async () => {
      // If already scanning on any element, stop it cleanly first
      if (this.html5QrCode && this.html5QrCode.isScanning) {
        try {
          await this.html5QrCode.stop();
        } catch (e) {
          console.warn('Error stopping previous scanner instance in start chain:', e);
        }
        this.html5QrCode = null;
      }

      this.html5QrCode = new Html5Qrcode(elementId, OPTIONS_LECTEUR_QR);
      this.activeElementId = elementId;

      // Mêmes réglages que le lecteur partagé (détecteur natif, 1080p, presque toute l'image analysée)
      const config = {
        fps: 20,
        qrbox: zoneAnalyseQr,
        disableFlip: facingMode === 'environment',
        videoConstraints: CONTRAINTES_VIDEO_QR(facingMode),
      };

      await this.html5QrCode.start(
        { facingMode },
        config,
        onSuccess,
        onFailure || (() => {})
      );
      // Mise au point et exposition continues quand la caméra les propose (sinon réglages du téléphone)
      try {
        const caps = this.html5QrCode.getRunningTrackCapabilities() as MediaTrackCapabilities & { focusMode?: string[]; exposureMode?: string[] };
        const reglages: Record<string, string> = {};
        if (caps.focusMode?.includes('continuous')) reglages.focusMode = 'continuous';
        if (caps.exposureMode?.includes('continuous')) reglages.exposureMode = 'continuous';
        if (Object.keys(reglages).length > 0) await this.html5QrCode.applyVideoConstraints({ advanced: [reglages as MediaTrackConstraintSet] });
      } catch { /* caméra sans réglages avancés : on garde les siens */ }
    });

    return this.currentOp;
  }

  async stop(): Promise<void> {
    this.currentOp = this.currentOp.then(async () => {
      if (this.html5QrCode) {
        if (this.html5QrCode.isScanning) {
          try {
            await this.html5QrCode.stop();
          } catch (e) {
            console.warn('Error stopping scanner instance in stop chain:', e);
          }
        }
        this.html5QrCode = null;
      }
      this.activeElementId = null;
    });

    return this.currentOp;
  }

  isScanning(): boolean {
    return !!(this.html5QrCode && this.html5QrCode.isScanning);
  }
}
