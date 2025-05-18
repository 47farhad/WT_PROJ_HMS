// fix-imports.js
const fs = require('fs');
const path = require('path');

const sourceDir = './src';

function fixImportsInDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      fixImportsInDir(filePath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix relative imports that don't have file extensions
      const newContent = content.replace(
        /from\s+['"](\.[^'"]*)['"]/g,
        (match, importPath) => {
          // Skip if the import already has an extension
          if (importPath.endsWith('.js')) {
            return match;
          }
          return `from '${importPath}.js'`;
        }
      );
      
      if (content !== newContent) {
        console.log(`Fixed imports in ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  }
}

fixImportsInDir(sourceDir);
console.log('All imports fixed!');