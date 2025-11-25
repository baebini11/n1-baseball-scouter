import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

console.log('pdf type:', typeof pdf);
console.log('pdf:', pdf);

const buffer = fs.readFileSync('public/jlptn1.pdf');

if (typeof pdf === 'function') {
    pdf(buffer).then(data => {
        console.log('Success!');
        console.log(data.text.substring(0, 100));
        fs.writeFileSync('scripts/pdf_preview.txt', data.text);
    }).catch(e => console.error(e));
} else {
    console.log('Still not a function');
}
