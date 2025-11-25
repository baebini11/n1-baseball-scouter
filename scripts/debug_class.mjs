import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const buffer = fs.readFileSync('public/jlptn1.pdf');

try {
    const instance = new pdf.PDFParse(buffer);
    console.log('Instance:', instance);
    console.log('Instance keys:', Object.keys(instance));
    console.log('Instance proto:', Object.getPrototypeOf(instance));
} catch (e) {
    console.log('Error instantiating:', e.message);
}
