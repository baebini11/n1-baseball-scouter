import fs from 'fs';
import pdf from 'pdf-parse/index.js';

const dataBuffer = fs.readFileSync('public/jlptn1.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('Number of pages:', data.numpages);
    console.log('Text content preview:\n');
    console.log(data.text.substring(0, 2000));

    fs.writeFileSync('scripts/pdf_preview.txt', data.text);
});
