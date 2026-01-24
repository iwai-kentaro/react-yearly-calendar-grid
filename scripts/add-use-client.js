const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

const files = ['index.js', 'index.mjs'];

files.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
      fs.writeFileSync(filePath, `"use client";\n${content}`);
      console.log(`Added "use client" to ${file}`);
    }
  }
});
