import React, { useState, useCallback, useEffect } from 'react'
import { Upload, Info, Camera, Copy, Check, MapPin } from 'lucide-react'
import { fileToBase64 } from '../utils/imageProcessing'
import { useToast } from '../hooks/use-toast'
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
            <img src={selectedImage} alt="预览" className="max-w-md mx-auto rounded-lg" />
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
    </div>
  )
}

export default MetadataViewer
