const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-\[\#5B6BF9\]/g, replace: 'bg-primary' },
  { search: /text-\[\#5B6BF9\]/g, replace: 'text-primary' },
  { search: /border-\[\#5B6BF9\]/g, replace: 'border-primary' },
  { search: /shadow-\[\#5B6BF9\]/g, replace: 'shadow-primary' },
  
  { search: /bg-indigo-600/g, replace: 'bg-primary' },
  { search: /text-indigo-600/g, replace: 'text-primary' },
  { search: /border-indigo-600/g, replace: 'border-primary' },
  { search: /ring-indigo-600/g, replace: 'ring-primary' },
  { search: /fill-indigo-600/g, replace: 'fill-primary' },
  { search: /stroke-indigo-600/g, replace: 'stroke-primary' },

  { search: /bg-indigo-700/g, replace: 'bg-primary/90' },
  { search: /text-indigo-700/g, replace: 'text-primary/90' },
  { search: /border-indigo-700/g, replace: 'border-primary/90' },

  { search: /bg-indigo-500/g, replace: 'bg-primary/80' },
  { search: /text-indigo-500/g, replace: 'text-primary/80' },
  { search: /border-indigo-500/g, replace: 'border-primary/80' },
  { search: /ring-indigo-500/g, replace: 'ring-primary/80' },

  { search: /bg-indigo-100/g, replace: 'bg-primary/20' },
  { search: /text-indigo-100/g, replace: 'text-primary/20' },
  { search: /border-indigo-100/g, replace: 'border-primary/20' },

  { search: /bg-indigo-50/g, replace: 'bg-primary/10' },
  { search: /text-indigo-50/g, replace: 'text-primary/10' },
  { search: /border-indigo-50/g, replace: 'border-primary/10' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      replacements.forEach(rule => {
        content = content.replace(rule.search, rule.replace);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory('./src');
console.log('Replacement finished!');
