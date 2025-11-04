import React, { useState, useCallback, useEffect } from 'react'
import { Upload, Info } from 'lucide-react'
import { fileToBase64 } from '../utils/imageProcessing'

interface MetadataViewerProps {
  onComplete?: () => void
}

interface ImageMetadata {
  fileName: string
  fileSize: string
  dimensions: string
  format: string
  lastModified: string
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ onComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      const imageData = await fileToBase64(selectedFile)
      setSelectedImage(imageData)
      setFile(selectedFile)
    } catch (err) {
      alert('图片加载失败')
    }
  }, [])

  useEffect(() => {
    if (!file || !selectedImage) return

    const img = new Image()
    img.onload = () => {
      setMetadata({
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        dimensions: `${img.width} x ${img.height}`,
        format: file.type,
        lastModified: new Date(file.lastModified).toLocaleString('zh-CN'),
      })
    }
    img.src = selectedImage
  }, [file, selectedImage])

  return (
    <div className="space-y-6">
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传图片查看元数据</p>
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

          {metadata && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                基本信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">文件名</span>
                  <span className="font-mono">{metadata.fileName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">文件大小</span>
                  <span className="font-mono">{metadata.fileSize}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">图片尺寸</span>
                  <span className="font-mono">{metadata.dimensions}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">图片格式</span>
                  <span className="font-mono">{metadata.format}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">最后修改</span>
                  <span className="font-mono text-sm">{metadata.lastModified}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>提示：</strong> 更详细的EXIF信息（如GPS位置、相机参数等）需要使用专门的EXIF解析库。当前版本显示基础元数据信息。
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedImage(null)
              setMetadata(null)
              setFile(null)
            }}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            重新选择
          </button>
        </div>
      )}
    </div>
  )
}

export default MetadataViewer
