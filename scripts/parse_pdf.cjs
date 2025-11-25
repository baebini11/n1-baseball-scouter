const fs = require('fs');
// Use direct path to CJS entry point
const pdf = require('./pdf-parse-full.cjs').default;

const dataBuffer = fs.readFileSync('public/jlptn1.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('Text extracted successfully.');
    fs.writeFileSync('scripts/pdf_raw.txt', data.text);
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
