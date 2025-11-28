const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 원본 이미지를 4분할하여 배경 포함 버전 저장 (확대 보기용)
const originalImage = 'C:/Users/baebi/.gemini/antigravity/brain/04830c6d-a850-4ccb-a4e4-c1243e0cde8f/uploaded_image_1764356168249.png';
const outputDir = path.join(__dirname, '../../public/images/positions');

async function saveOriginals() {
    try {
        // 이미지 메타데이터 가져오기
        const metadata = await sharp(originalImage).metadata();
        const { width, height } = metadata;

        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        // 4개 영역 정의
        const positions = [
            { name: 'catcher_full.png', left: 0, top: 0, width: halfWidth, height: halfHeight },
            { name: 'outfielder_full.png', left: halfWidth, top: 0, width: halfWidth, height: halfHeight },
            { name: 'infielder_full.png', left: 0, top: halfHeight, width: halfWidth, height: halfHeight },
            { name: 'pitcher_full.png', left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight }
        ];

        for (const pos of positions) {
            // 각 영역 추출 (원본 그대로 저장)
            await sharp(originalImage)
                .extract({ left: pos.left, top: pos.top, width: pos.width, height: pos.height })
                .toFile(path.join(outputDir, pos.name));

            console.log(`✓ Saved: ${pos.name}`);
        }

        console.log('\n모든 원본 이미지 저장 완료!');
    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

saveOriginals();
