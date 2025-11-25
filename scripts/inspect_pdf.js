const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('public/jlptn1.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('Number of pages:', data.numpages);
    console.log('Info:', data.info);
    console.log('Text content preview:\n');
    console.log(data.text.substring(0, 2000)); // First 2000 chars

    // Save to a file for the agent to read
    fs.writeFileSync('scripts/pdf_preview.txt', data.text);
});
