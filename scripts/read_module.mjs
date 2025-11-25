import fs from 'fs';
const content = fs.readFileSync('node_modules/pdf-parse/index.js', 'utf8');
console.log(content);
