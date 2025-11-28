
import React, { useState, useEffect } from 'react';

/**
 * SpriteAnimation Component
 * 
 * 스프라이트 시트 이미지를 사용하여 애니메이션을 재생하는 컴포넌트입니다.
 * 
 * @param {string} src - 이미지 경로 (import된 이미지 변수 또는 URL)
 * @param {number} rows - 스프라이트 시트의 행 개수
 * @param {number} cols - 스프라이트 시트의 열 개수
 * @param {number} width - 표시할 프레임의 너비 (px)
 * @param {number} height - 표시할 프레임의 높이 (px)
 * @param {number} fps - 초당 프레임 수 (애니메이션 속도)
 * @param {number} scale - 크기 배율 (기본값 1)
 * @param {number} [animationRow=null] - 특정 행만 재생하려면 이 값을 설정 (0부터 시작)
 */
const SpriteAnimation = ({
    src,
    rows = 1,
    cols = 1,
    width = 100,
    height = 100,
    fps = 10,
    scale = 1,
    animationRow = null, // 특정 행만 재생하려면 이 값을 설정 (0부터 시작)
}) => {
    const [frame, setFrame] = useState(0);

    // animationRow가 설정되어 있으면 해당 행의 열 개수만큼만 프레임 반복
    // 설정되어 있지 않으면 전체 프레임 반복
    const totalFrames = animationRow !== null ? cols : rows * cols;

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame((prev) => (prev + 1) % totalFrames);
        }, 1000 / fps);

        return () => clearInterval(interval);
    }, [fps, totalFrames]);

    // 현재 프레임의 행/열 인덱스 계산
    let colIndex, rowIndex;

    if (animationRow !== null) {
        // 특정 행만 재생할 경우
        colIndex = frame;
        rowIndex = animationRow;
    } else {
        // 전체 재생할 경우
        colIndex = frame % cols;
        rowIndex = Math.floor(frame / cols);
    }

    // 배경 이미지 크기 및 위치 계산
    // 배경 크기는 단일 프레임 크기가 아니라 전체 이미지 크기 비율이어야 함
    // 예: 2열이면 배경 너비는 컨테이너의 200%
    const bgWidth = cols * 100;
    const bgHeight = rows * 100;

    // 배경 위치 (백분율)
    // 0%는 시작, 100%는 끝.
    // cols > 1 일 때만 계산 (1열이면 항상 0)
    const xPos = cols > 1 ? (colIndex / (cols - 1)) * 100 : 0;
    const yPos = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 0;

    return (
        <div
            style={{
                width: `${width * scale}px`,
                height: `${height * scale}px`,
                backgroundImage: `url(${src})`,
                backgroundSize: `${bgWidth}% ${bgHeight}%`,
                backgroundPosition: `${xPos}% ${yPos}%`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated', // 픽셀 아트가 선명하게 보이도록 설정
            }}
        />
    );
};

export default SpriteAnimation;
