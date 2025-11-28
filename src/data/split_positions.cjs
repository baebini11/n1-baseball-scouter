const fs = require('fs');
const path = require('path');

// Canvas API를 사용하기 위한 node-canvas 대신, 간단하게 sharp 라이브러리 사용
// sharp가 없다면 설치: npm install sharp

const sharp = require('sharp');

const inputPath = 'C:/Users/baebi/.gemini/antigravity/brain/04830c6d-a850-4ccb-a4e4-c1243e0cde8f/uploaded_image_1764355685684.png';
const outputDir = path.join(__dirname, '../../public/images/positions');

async function splitImage() {
    try {
        // 이미지 메타데이터 가져오기
        const metadata = await sharp(inputPath).metadata();
        const { width, height } = metadata;

        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        // 4개 영역 정의
        const positions = [
            { name: 'catcher.png', left: 0, top: 0, width: halfWidth, height: halfHeight },           // 좌상단 - 포수
            { name: 'outfielder.png', left: halfWidth, top: 0, width: halfWidth, height: halfHeight }, // 우상단 - 외야수
            { name: 'infielder.png', left: 0, top: halfHeight, width: halfWidth, height: halfHeight }, // 좌하단 - 내야수
            { name: 'pitcher.png', left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight } // 우하단 - 투수
        ];

        // 각 영역 추출 및 저장
        for (const pos of positions) {
            await sharp(inputPath)
                .extract({ left: pos.left, top: pos.top, width: pos.width, height: pos.height })
                .toFile(path.join(outputDir, pos.name));
            console.log(`✓ Saved: ${pos.name}`);
        }

        console.log('\n모든 이미지 분할 완료!');
    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

splitImage();
