const fs = require('fs');
const content = fs.readFileSync('public/jlptn1.pdf', 'latin1'); // latin1 preserves bytes as chars
console.log(content.substring(0, 2000));
fs.writeFileSync('scripts/pdf_raw_latin1.txt', content);
