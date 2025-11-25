import * as pdfLib from 'pdf-parse';
import fs from 'fs';

const buffer = fs.readFileSync('public/jlptn1.pdf');

console.log('Trying pdfLib(buffer)...');
try {
    pdfLib(buffer).then(d => console.log('Success default call', d.text.substring(0, 100)));
} catch (e) {
    console.log('Failed default call:', e.message);
}

console.log('Trying pdfLib.PDFParse(buffer)...');
try {
    // It might be a static method or class
    // @ts-ignore
    new pdfLib.PDFParse(buffer).then(d => console.log('Success new PDFParse', d.text.substring(0, 100)));
} catch (e) {
    console.log('Failed new PDFParse:', e.message);
}

console.log('Trying pdfLib.default(buffer)...');
try {
    // @ts-ignore
    pdfLib.default(buffer).then(d => console.log('Success default export', d.text.substring(0, 100)));
} catch (e) {
    console.log('Failed default export:', e.message);
}
