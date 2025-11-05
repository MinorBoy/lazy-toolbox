import React, { useState, useCallback } from 'react'
import { Upload, Download, CheckCircle } from 'lucide-react'
import { fileToBase64, removeImageMetadata, downloadImage } from '../utils/imageProcessing'
import ImageFullscreenViewer from './ImageFullscreenViewer'

interface MetadataRemoverProps {
  onComplete?: () => void
}

const MetadataRemover: React.FC<MetadataRemoverProps> = ({ onComplete }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [processedImages, setProcessedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      const imageDataArray = await Promise.all(
        files.map((file) => fileToBase64(file))
      )
      setSelectedImages(imageDataArray)
      setProcessedImages([])
    } catch (err) {
      alert('图片加载失败')
    }
  }, [])

  const handleProcess = useCallback(async () => {
    if (selectedImages.length === 0) return

    setLoading(true)
    try {
      const processed = await Promise.all(
        selectedImages.map((image) => removeImageMetadata(image))
      )
      setProcessedImages(processed)
    } catch (err) {
      alert('处理失败')
    } finally {
      setLoading(false)
    }
  }, [selectedImages])

  const handleDownloadAll = useCallback(() => {
    processedImages.forEach((image, index) => {
      downloadImage(image, `cleaned-${index + 1}.png`)
    })
  }, [processedImages])

  return (
    <div className="space-y-6">
      {selectedImages.length === 0 ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传需要清除元数据的图片</p>
          <p className="text-gray-400 text-sm mb-4">支持批量上传</p>
          <label className="inline-block px-6 py-3 bg-purple-500 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors">
            选择图片
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">已选择 {selectedImages.length} 张图片</h3>
              {processedImages.length > 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>处理完成</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`图片 ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setFullscreenImage(image)
                    setFullscreenIndex(index)
                  }}
                  title="点击查看全屏"
                />
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>说明：</strong> 清除元数据会移除图片中的EXIF信息（包括GPS位置、拍摄时间、相机型号等），保护您的隐私。
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleProcess}
              disabled={loading || processedImages.length > 0}
              className="flex-1 px-6 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '处理中...' : processedImages.length > 0 ? '已处理' : '开始处理'}
            </button>
            {processedImages.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="px-6 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载全部
              </button>
            )}
            <button
              onClick={() => {
                setSelectedImages([])
                setProcessedImages([])
              }}
              className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              重新选择
            </button>
          </div>
        </div>
      )}

      {/* 全屏查看器 */}
      {fullscreenImage && (
        <ImageFullscreenViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          images={selectedImages}
          currentIndex={fullscreenIndex}
          onNavigate={(index) => {
            setFullscreenIndex(index)
            setFullscreenImage(selectedImages[index])
          }}
        />
      )}
    </div>
  )
}

export default MetadataRemover
