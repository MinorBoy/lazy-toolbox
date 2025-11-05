from PIL import Image
import piexif

# 创建一张简单的测试图片
img = Image.new('RGB', (800, 600), color='skyblue')

# 创建EXIF数据
exif_dict = {
    "0th": {
        piexif.ImageIFD.Make: b"Canon",
        piexif.ImageIFD.Model: b"Canon EOS 5D Mark IV",
        piexif.ImageIFD.Software: b"Adobe Photoshop 2024",
        piexif.ImageIFD.DateTime: b"2025:11:05 10:30:00",
        piexif.ImageIFD.Copyright: b"Copyright 2025 by Photographer",
        piexif.ImageIFD.Artist: b"John Smith",
        piexif.ImageIFD.XResolution: (300, 1),
        piexif.ImageIFD.YResolution: (300, 1),
    },
    "Exif": {
        piexif.ExifIFD.DateTimeOriginal: b"2025:11:05 10:30:00",
        piexif.ExifIFD.FNumber: (28, 10),  # f/2.8
        piexif.ExifIFD.ExposureTime: (1, 125),  # 1/125s
        piexif.ExifIFD.ISOSpeedRatings: 400,
        piexif.ExifIFD.FocalLength: (50, 1),  # 50mm
        piexif.ExifIFD.LensMake: b"Canon",
        piexif.ExifIFD.LensModel: b"EF 50mm f/1.4 USM",
        piexif.ExifIFD.ExposureMode: 0,
        piexif.ExifIFD.WhiteBalance: 0,
        piexif.ExifIFD.Flash: 16,
    },
    "GPS": {
        piexif.GPSIFD.GPSLatitudeRef: b"N",
        piexif.GPSIFD.GPSLatitude: ((39, 1), (54, 1), (2660, 100)),  # 39°54'26.60"N
        piexif.GPSIFD.GPSLongitudeRef: b"W",
        piexif.GPSIFD.GPSLongitude: ((116, 1), (23, 1), (5130, 100)),  # 116°23'51.30"W
        piexif.GPSIFD.GPSAltitude: (1000, 1),  # 1000m
        piexif.GPSIFD.GPSSpeed: (50, 1),  # 50 km/h
    }
}

# 编码EXIF数据
exif_bytes = piexif.dump(exif_dict)

# 保存图片
output_path = 'test_image_with_exif.jpg'
img.save(output_path, "JPEG", exif=exif_bytes, quality=95)

print(f"✓ 测试图片已创建: {output_path}")
print(f"  包含EXIF信息：相机型号、镜头信息、拍摄参数、GPS位置、版权信息等")
