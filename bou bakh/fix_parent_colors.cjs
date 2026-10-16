/**
 * Script de correction des couleurs hardcodées dans le Profil Parent
 * et les couleurs indigo restantes dans toute l'app.
 * NE TOUCHE PAS les fichiers du Super Admin (thème indépendant intentionnel).
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'frontend (Copie)', 'src');

// Fichiers à EXCLURE (Super Admin et landing page gardent leur thème propre)
const EXCLUDE_PATHS = [
  'features/super-admin',
  'features/public/ui/pages/LandingPage.tsx',
];

// Règles de remplacement : [regex, remplacement]
const REPLACEMENTS = [
  // ==== PROFIL PARENT : Bleu #1565C0 → primary ====
  // bg-[#1565C0] → bg-primary
  [/bg-\[#1565C0\]/g, 'bg-primary'],
  // text-[#1565C0] → text-primary
  [/text-\[#1565C0\]/g, 'text-primary'],
  // border-[#1565C0] → border-primary
  [/border-\[#1565C0\]/g, 'border-primary'],
  // ring-[#1565C0] → ring-primary
  [/ring-\[#1565C0\]/g, 'ring-primary'],
  // from-[#1565C0] → from-primary
  [/from-\[#1565C0\]/g, 'from-primary'],
  // to-[#1565C0] → to-primary
  [/to-\[#1565C0\]/g, 'to-primary'],
  // hover:bg-[#1565C0] → hover:bg-primary/90
  [/hover:bg-\[#1565C0\]/g, 'hover:bg-primary/90'],

  // ==== COULEURS INDIGO RESTANTES (hors super-admin) ====
  [/bg-indigo-600/g, 'bg-primary'],
  [/bg-indigo-700/g, 'bg-primary/90'],
  [/bg-indigo-500/g, 'bg-primary'],
  [/bg-indigo-400/g, 'bg-primary/80'],
  [/bg-indigo-100/g, 'bg-primary/15'],
  [/bg-indigo-50/g, 'bg-primary/10'],
  [/text-indigo-600/g, 'text-primary'],
  [/text-indigo-700/g, 'text-primary'],
  [/text-indigo-500/g, 'text-primary'],
  [/text-indigo-400/g, 'text-primary/80'],
  [/text-indigo-900/g, 'text-primary'],
  [/text-indigo-800/g, 'text-primary'],
  [/text-indigo-200/g, 'text-primary/40'],
  [/border-indigo-600/g, 'border-primary'],
  [/border-indigo-500/g, 'border-primary'],
  [/border-indigo-200/g, 'border-primary/30'],
  [/ring-indigo-500/g, 'ring-primary'],
  [/ring-indigo-600/g, 'ring-primary'],
  [/focus:ring-indigo-500/g, 'focus:ring-primary/50'],
  [/focus:border-indigo-500/g, 'focus:border-primary'],
  [/hover:bg-indigo-700/g, 'hover:bg-primary/90'],
  [/hover:bg-indigo-600/g, 'hover:bg-primary/90'],
  [/from-indigo-600/g, 'from-primary'],
  [/to-indigo-600/g, 'to-primary'],
  [/from-indigo-400/g, 'from-primary/80'],
  [/shadow-indigo-500\/20/g, 'shadow-primary/20'],
  [/shadow-indigo-600\/20/g, 'shadow-primary/20'],
  [/shadow-indigo-500\/30/g, 'shadow-primary/30'],

  // ==== TenantLoginPage spinner indigo → primary ====
  [/border-indigo-200 border-t-indigo-600/g, 'border-primary/30 border-t-primary'],
];

let totalFiles = 0;
let totalReplacements = 0;

function shouldExclude(filePath) {
  return EXCLUDE_PATHS.some(excl => filePath.includes(excl));
}

function processFile(filePath) {
  if (shouldExclude(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;

  for (const [pattern, replacement] of REPLACEMENTS) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      const count = (before.match(pattern) || []).length;
      fileReplacements += count;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFiles++;
    totalReplacements += fileReplacements;
    console.log(`✅ [${fileReplacements} rempl.] ${path.relative(SRC_DIR, filePath)}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css'))) {
      processFile(fullPath);
    }
  }
}

console.log('🔍 Début de la correction des couleurs Parent et indigo restantes...\n');
walkDir(SRC_DIR);
console.log(`\n✨ Terminé ! ${totalFiles} fichiers modifiés, ${totalReplacements} remplacements effectués.`);

