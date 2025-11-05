import React, { useState, useCallback, useEffect } from 'react'
import { Upload, Info, Camera, Copy, Check, MapPin, User, FileText, Settings } from 'lucide-react'
import { fileToBase64 } from '../utils/imageProcessing'
import { useToast } from '../hooks/use-toast'
import ImageFullscreenViewer from './ImageFullscreenViewer'
import exifr from 'exifr'

interface MetadataViewerProps {
  onComplete?: () => void
}

interface BasicMetadata {
  fileName: string
  fileSize: string
  dimensions: string
  format: string
  lastModified: string
}

interface ExifData {
  [key: string]: any
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ onComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [basicMetadata, setBasicMetadata] = useState<BasicMetadata | null>(null)
  const [exifData, setExifData] = useState<ExifData | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      const imageData = await fileToBase64(selectedFile)
      setSelectedImage(imageData)
      setFile(selectedFile)
      
      // Parse EXIF data
      try {
        const exif = await exifr.parse(selectedFile, true)
        setExifData(exif || null)
      } catch (exifError) {
        console.log('No EXIF data found')
        setExifData(null)
      }
    } catch (err) {
      toast({
        title: '错误',
        description: '图片加载失败',
        variant: 'destructive'
      })
    }
  }, [toast])

  useEffect(() => {
    if (!file || !selectedImage) return

    const img = new Image()
    img.onload = () => {
      setBasicMetadata({
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        dimensions: `${img.width} x ${img.height}`,
        format: file.type,
        lastModified: new Date(file.lastModified).toLocaleString('zh-CN'),
      })
    }
    img.src = selectedImage
  }, [file, selectedImage])

  const copyToClipboard = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName)
      toast({
        title: '已复制',
        description: `${fieldName}已复制到剪贴板`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    }).catch(() => {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive'
      })
    })
  }, [toast])

  const copyAllMetadata = useCallback(() => {
    if (!basicMetadata && !exifData) return

    let allText = '===== 基本信息 =====\n'
    if (basicMetadata) {
      allText += `文件名: ${basicMetadata.fileName}\n`
      allText += `文件大小: ${basicMetadata.fileSize}\n`
      allText += `图片尺寸: ${basicMetadata.dimensions}\n`
      allText += `图片格式: ${basicMetadata.format}\n`
      allText += `最后修改: ${basicMetadata.lastModified}\n`
    }

    if (exifData) {
      allText += '\n===== EXIF 信息 =====\n'
      Object.entries(exifData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          allText += `${key}: ${String(value)}\n`
        }
      })
    }

    navigator.clipboard.writeText(allText).then(() => {
      toast({
        title: '已复制',
        description: '所有元数据已复制到剪贴板',
      })
    })
  }, [basicMetadata, exifData, toast])

  const MetadataRow = ({ label, value, fieldKey }: { label: string; value: string; fieldKey: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 group">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{value}</span>
        <button
          onClick={() => copyToClipboard(value, label)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
          title="复制"
        >
          {copiedField === label ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  )

  const formatExifValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toLocaleString('zh-CN')
      return JSON.stringify(value)
    }
    return String(value)
  }

  return (
    <div className="space-y-6">
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传图片查看元数据</p>
          <p className="text-sm text-gray-400 mb-4">支持查看完整EXIF信息，包括相机参数、GPS位置等</p>
          <label className="inline-block px-6 py-3 bg-purple-500 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors mt-4">
            选择图片
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <img 
              src={selectedImage} 
              alt="预览" 
              className="max-w-md mx-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => setIsFullscreen(true)}
              title="点击查看全屏"
            />
            <p className="text-center text-sm text-gray-400 mt-2">点击图片查看全屏</p>
          </div>

          {/* 基本信息 */}
          {basicMetadata && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                基本信息
              </h3>
              <div className="space-y-1">
                <MetadataRow label="文件名" value={basicMetadata.fileName} fieldKey="fileName" />
                <MetadataRow label="文件大小" value={basicMetadata.fileSize} fieldKey="fileSize" />
                <MetadataRow label="图片尺寸" value={basicMetadata.dimensions} fieldKey="dimensions" />
                <MetadataRow label="图片格式" value={basicMetadata.format} fieldKey="format" />
                <MetadataRow label="最后修改" value={basicMetadata.lastModified} fieldKey="lastModified" />
              </div>
            </div>
          )}

          {/* 相机信息 */}
          {exifData && (exifData.Make || exifData.Model || exifData.LensMake || exifData.LensModel) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                相机信息
              </h3>
              <div className="space-y-1">
                {exifData.Make && <MetadataRow label="相机制造商" value={exifData.Make} fieldKey="Make" />}
                {exifData.Model && <MetadataRow label="相机型号" value={exifData.Model} fieldKey="Model" />}
                {exifData.LensMake && <MetadataRow label="镜头制造商" value={exifData.LensMake} fieldKey="LensMake" />}
                {exifData.LensModel && <MetadataRow label="镜头型号" value={exifData.LensModel} fieldKey="LensModel" />}
                {exifData.Software && <MetadataRow label="软件" value={exifData.Software} fieldKey="Software" />}
              </div>
            </div>
          )}

          {/* 拍摄参数 */}
          {exifData && (exifData.ISO || exifData.FNumber || exifData.ExposureTime || exifData.FocalLength) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-green-400" />
                拍摄参数
              </h3>
              <div className="space-y-1">
                {exifData.ISO && <MetadataRow label="ISO" value={String(exifData.ISO)} fieldKey="ISO" />}
                {exifData.FNumber && <MetadataRow label="光圈" value={`f/${exifData.FNumber}`} fieldKey="FNumber" />}
                {exifData.ExposureTime && (
                  <MetadataRow 
                    label="快门速度" 
                    value={exifData.ExposureTime < 1 ? `1/${Math.round(1/exifData.ExposureTime)}s` : `${exifData.ExposureTime}s`}
                    fieldKey="ExposureTime" 
                  />
                )}
                {exifData.FocalLength && <MetadataRow label="焦距" value={`${exifData.FocalLength}mm`} fieldKey="FocalLength" />}
                {exifData.ExposureMode && <MetadataRow label="曝光模式" value={String(exifData.ExposureMode)} fieldKey="ExposureMode" />}
                {exifData.WhiteBalance && <MetadataRow label="白平衡" value={String(exifData.WhiteBalance)} fieldKey="WhiteBalance" />}
                {exifData.Flash && <MetadataRow label="闪光灯" value={String(exifData.Flash)} fieldKey="Flash" />}
              </div>
            </div>
          )}

          {/* GPS信息 */}
          {exifData && (exifData.latitude || exifData.longitude) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                GPS位置信息
              </h3>
              <div className="space-y-1">
                {exifData.latitude && <MetadataRow label="纬度" value={String(exifData.latitude)} fieldKey="latitude" />}
                {exifData.longitude && <MetadataRow label="经度" value={String(exifData.longitude)} fieldKey="longitude" />}
                {exifData.GPSAltitude && <MetadataRow label="海拔" value={`${exifData.GPSAltitude}m`} fieldKey="GPSAltitude" />}
                {exifData.GPSSpeed && <MetadataRow label="速度" value={`${exifData.GPSSpeed} km/h`} fieldKey="GPSSpeed" />}
                {exifData.GPSImgDirection && <MetadataRow label="拍摄方向" value={`${exifData.GPSImgDirection}°`} fieldKey="GPSImgDirection" />}
              </div>
            </div>
          )}

          {/* 版权和作者信息 */}
          {exifData && (exifData.Copyright || exifData.Artist || exifData.Creator || exifData.Author) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                版权和作者信息
              </h3>
              <div className="space-y-1">
                {exifData.Copyright && <MetadataRow label="版权" value={String(exifData.Copyright)} fieldKey="Copyright" />}
                {exifData.Artist && <MetadataRow label="艺术家/作者" value={String(exifData.Artist)} fieldKey="Artist" />}
                {exifData.Creator && <MetadataRow label="创建者" value={String(exifData.Creator)} fieldKey="Creator" />}
                {exifData.Author && <MetadataRow label="作者" value={String(exifData.Author)} fieldKey="Author" />}
                {exifData.Rights && <MetadataRow label="权利声明" value={String(exifData.Rights)} fieldKey="Rights" />}
                {exifData.OwnerName && <MetadataRow label="所有者" value={String(exifData.OwnerName)} fieldKey="OwnerName" />}
              </div>
            </div>
          )}

          {/* 相机设置信息 */}
          {exifData && (exifData.MeteringMode || exifData.SceneCaptureType || exifData.ExposureProgram || exifData.ExposureBiasValue) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                相机设置信息
              </h3>
              <div className="space-y-1">
                {exifData.ExposureProgram !== undefined && <MetadataRow label="曝光程序" value={String(exifData.ExposureProgram)} fieldKey="ExposureProgram" />}
                {exifData.MeteringMode !== undefined && <MetadataRow label="测光模式" value={String(exifData.MeteringMode)} fieldKey="MeteringMode" />}
                {exifData.ExposureBiasValue !== undefined && <MetadataRow label="曝光补偿" value={`${exifData.ExposureBiasValue} EV`} fieldKey="ExposureBiasValue" />}
                {exifData.SceneCaptureType !== undefined && <MetadataRow label="场景模式" value={String(exifData.SceneCaptureType)} fieldKey="SceneCaptureType" />}
                {exifData.LightSource !== undefined && <MetadataRow label="光源" value={String(exifData.LightSource)} fieldKey="LightSource" />}
                {exifData.SensingMethod !== undefined && <MetadataRow label="感光方式" value={String(exifData.SensingMethod)} fieldKey="SensingMethod" />}
                {exifData.DigitalZoomRatio !== undefined && <MetadataRow label="数码变焦" value={String(exifData.DigitalZoomRatio)} fieldKey="DigitalZoomRatio" />}
                {exifData.MaxApertureValue !== undefined && <MetadataRow label="最大光圈" value={`f/${exifData.MaxApertureValue}`} fieldKey="MaxApertureValue" />}
                {exifData.FocalLengthIn35mmFormat && <MetadataRow label="等效35mm焦距" value={`${exifData.FocalLengthIn35mmFormat}mm`} fieldKey="FocalLengthIn35mmFormat" />}
              </div>
            </div>
          )}

          {/* 图像描述和注释 */}
          {exifData && (exifData.ImageDescription || exifData.UserComment || exifData.Subject || exifData.Keywords) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                图像描述和注释
              </h3>
              <div className="space-y-1">
                {exifData.ImageDescription && <MetadataRow label="图像描述" value={String(exifData.ImageDescription)} fieldKey="ImageDescription" />}
                {exifData.UserComment && <MetadataRow label="用户注释" value={String(exifData.UserComment)} fieldKey="UserComment" />}
                {exifData.Subject && <MetadataRow label="主题" value={String(exifData.Subject)} fieldKey="Subject" />}
                {exifData.Keywords && <MetadataRow label="关键词" value={formatExifValue(exifData.Keywords)} fieldKey="Keywords" />}
                {exifData.Caption && <MetadataRow label="标题" value={String(exifData.Caption)} fieldKey="Caption" />}
              </div>
            </div>
          )}

          {/* 其他技术参数 */}
          {exifData && (exifData.ColorSpace || exifData.DateTimeOriginal || exifData.CreateDate) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-400" />
                其他技术参数
              </h3>
              <div className="space-y-1">
                {exifData.ColorSpace && <MetadataRow label="色彩空间" value={String(exifData.ColorSpace)} fieldKey="ColorSpace" />}
                {exifData.DateTimeOriginal && <MetadataRow label="拍摄时间" value={formatExifValue(exifData.DateTimeOriginal)} fieldKey="DateTimeOriginal" />}
                {exifData.CreateDate && <MetadataRow label="创建时间" value={formatExifValue(exifData.CreateDate)} fieldKey="CreateDate" />}
                {exifData.Orientation && <MetadataRow label="方向" value={String(exifData.Orientation)} fieldKey="Orientation" />}
                {exifData.XResolution && <MetadataRow label="水平分辨率" value={`${exifData.XResolution} dpi`} fieldKey="XResolution" />}
                {exifData.YResolution && <MetadataRow label="垂直分辨率" value={`${exifData.YResolution} dpi`} fieldKey="YResolution" />}
              </div>
            </div>
          )}

          {/* 如果没有EXIF数据 */}
          {!exifData && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>提示：</strong> 该图片不包含EXIF信息，或EXIF数据已被移除。
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={copyAllMetadata}
              className="flex-1 px-4 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制全部元数据
            </button>
            <button
              onClick={() => {
                setSelectedImage(null)
                setBasicMetadata(null)
                setExifData(null)
                setFile(null)
              }}
              className="flex-1 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              重新选择
            </button>
          </div>
        </div>
      )}

      {/* 全屏查看器 */}
      {isFullscreen && selectedImage && (
        <ImageFullscreenViewer
          imageUrl={selectedImage}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </div>
  )
}

export default MetadataViewer
