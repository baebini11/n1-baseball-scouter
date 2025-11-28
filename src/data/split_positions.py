from PIL import Image
import os

# 이미지 로드
img_path = r'C:/Users/baebi/.gemini/antigravity/brain/2201d95b-7b73-488c-ab8f-e4a296d2c9d4/uploaded_image_1764355176823.png'
output_dir = r'c:/Users/baebi/OneDrive/Desktop/pjt/n1bs/frontend/public/images/positions'

img = Image.open(img_path)
width, height = img.size

# 반으로 나누기
half_width = width // 2
half_height = height // 2

# 4개 영역 분할
positions = {
    'catcher.png': (0, 0, half_width, half_height),          # 좌상단 - 포수
    'outfielder.png': (half_width, 0, width, half_height),   # 우상단 - 외야수
    'infielder.png': (0, half_height, half_width, height),   # 좌하단 - 내야수
    'pitcher.png': (half_width, half_height, width, height)  # 우하단 - 투수
}

# 각 영역 크롭 및 저장
for filename, box in positions.items():
    cropped = img.crop(box)
    output_path = os.path.join(output_dir, filename)
    cropped.save(output_path, 'PNG')
    print(f'Saved: {output_path}')

print('\\nAll images split successfully!')
