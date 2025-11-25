const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/joyo_kanji_raw.json');
const outputPath = path.join(__dirname, '../src/data/joyo_kanji.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const kanjiList = JSON.parse(rawData);

    // Check if it's already in the correct format (array with onyomi field)
    if (Array.isArray(kanjiList) && kanjiList.length > 0 && kanjiList[0].onyomi) {
        console.log("Data already in correct format.");
        process.exit(0);
    }

    let transformed = [];
    let index = 1;

    // Handle Object format (Key is Kanji)
    for (const [char, data] of Object.entries(kanjiList)) {
        // Filter for Joyo Kanji (Grades 1-6 and 8)
        // Some datasets use 'grade' null for non-joyo.
        if (data.grade && (data.grade <= 6 || data.grade === 8)) {
            transformed.push({
                id: `j${index++}`,
                kanji: char,
                onyomi: data.readings_on || [],
                kunyomi: data.readings_kun || [],
                meaning: Array.isArray(data.meanings) ? data.meanings.join(', ') : (data.meanings || '')
            });
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
    console.log(`Successfully transformed ${transformed.length} kanji.`);

} catch (err) {
    console.error("Error transforming data:", err);
    process.exit(1);
}
