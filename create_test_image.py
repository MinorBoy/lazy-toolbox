from PIL import Image, ImageDraw, ImageFont
import os

# 创建一张测试图片
width, height = 800, 600
image = Image.new('RGB', (width, height), color='lightblue')

# 添加一些内容
draw = ImageDraw.Draw(image)

# 绘制一些几何图形作为测试内容
draw.rectangle([100, 100, 300, 200], fill='red', outline='black', width=3)
draw.ellipse([400, 100, 600, 200], fill='green', outline='black', width=3)
draw.polygon([(150, 350), (300, 300), (250, 450)], fill='yellow', outline='black')

# 添加水印
try:
    # 尝试使用默认字体
    font = ImageFont.load_default()
except:
    font = None

# 在右下角添加水印
watermark_text = "TEST WATERMARK"
if font:
    # 获取文本尺寸
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
else:
    text_width = len(watermark_text) * 10
    text_height = 20

# 位置：右下角，留一些边距
x = width - text_width - 20
y = height - text_height - 20

# 绘制水印背景（半透明效果）
draw.rectangle([x-5, y-5, x+text_width+5, y+text_height+5], fill=(255, 255, 255, 180))

# 绘制水印文字
draw.text((x, y), watermark_text, fill='purple', font=font)

# 保存图片
image.save('/workspace/test_image_with_watermark.png')
print("测试图片已创建：/workspace/test_image_with_watermark.png")