const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 원본 이미지를 다시 분할하여 배경 제거 적용
const originalImage = 'C:/Users/baebi/.gemini/antigravity/brain/04830c6d-a850-4ccb-a4e4-c1243e0cde8f/uploaded_image_1764355685684.png';
const outputDir = path.join(__dirname, '../../public/images/positions');

async function splitAndRemoveBackground() {
    try {
        // 이미지 메타데이터 가져오기
        const metadata = await sharp(originalImage).metadata();
        const { width, height } = metadata;

        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        // 4개 영역 정의
        const positions = [
            { name: 'catcher.png', left: 0, top: 0, width: halfWidth, height: halfHeight },
            { name: 'outfielder.png', left: halfWidth, top: 0, width: halfWidth, height: halfHeight },
            { name: 'infielder.png', left: 0, top: halfHeight, width: halfWidth, height: halfHeight },
            { name: 'pitcher.png', left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight }
        ];

        for (const pos of positions) {
            // 각 영역 추출
            const { data, info } = await sharp(originalImage)
                .extract({ left: pos.left, top: pos.top, width: pos.width, height: pos.height })
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            // 픽셀 단위로 배경 제거
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // 체크무늬 배경 제거 로직 개선
                // 1. R, G, B 값이 거의 동일 (회색조)
                // 2. 매우 밝음 (230 이상)
                const isGrayscale = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
                const isBright = r >= 230 && g >= 230 && b >= 230;

                if (isGrayscale && isBright) {
                    data[i + 3] = 0; // 투명하게 처리
                }
            }

            // 처리된 이미지 저장
            await sharp(data, {
                raw: {
                    width: info.width,
                    height: info.height,
                    channels: 4
                }
            })
                .png()
                .toFile(path.join(outputDir, pos.name));

            console.log(`✓ Processed: ${pos.name}`);
        }

        console.log('\n모든 이미지 처리 완료!');
    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

splitAndRemoveBackground();
