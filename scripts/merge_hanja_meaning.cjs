const fs = require('fs');
const path = require('path');

const joyoPath = path.join(__dirname, '../src/data/joyo_kanji.json');
const hanjaPath = path.join(__dirname, '../src/data/hanja_naver.json');

try {
    const joyoData = JSON.parse(fs.readFileSync(joyoPath, 'utf8'));
    const hanjaData = JSON.parse(fs.readFileSync(hanjaPath, 'utf8'));

    const hanjaMap = {};

    // hanjaData is an object where keys are Hangul syllables and values are arrays of entries
    Object.values(hanjaData).forEach(entries => {
        entries.forEach(item => {
            const char = item.entryName;
            const pron = item.pron; // e.g., "옳을 가"

            if (char && pron) {
                hanjaMap[char] = pron;
            }
        });
    });

    let updatedCount = 0;
    const updatedJoyo = joyoData.map(item => {
        if (hanjaMap[item.kanji]) {
            updatedCount++;
            return { ...item, meaning: hanjaMap[item.kanji] };
        }
        return item;
    });

    fs.writeFileSync(joyoPath, JSON.stringify(updatedJoyo, null, 2));
    console.log(`Updated ${updatedCount} kanji with Korean meanings.`);

} catch (err) {
    console.error("Error merging data:", err);
}
