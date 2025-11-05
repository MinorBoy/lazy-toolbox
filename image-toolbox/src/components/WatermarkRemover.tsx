import React, { useState, useCallback } from 'react'
import { Upload, Download, Info } from 'lucide-react'
import { fileToBase64, downloadImage, removeWatermark } from '../utils/imageProcessing'
import ImageFullscreenViewer from './ImageFullscreenViewer'

interface WatermarkRemoverProps {
  onComplete?: () => void
}

const WatermarkRemover: React.FC<WatermarkRemoverProps> = ({ onComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageData = await fileToBase64(file)
      setSelectedImage(imageData)
      setProcessedImage(null)
      setError(null)
    } catch (err) {
      setError('图片加载失败')
    }
  }, [])

  const handleProcess = useCallback(async () => {
    if (!selectedImage) return

    setLoading(true)
    setError(null)

    try {
      // 使用基于图像修复算法的去水印功能
      const processed = await removeWatermark(selectedImage)
      setProcessedImage(processed)
    } catch (err: any) {
      setError(err.message || '处理失败')
    } finally {
      setLoading(false)
    }
  }, [selectedImage])

  const handleDownload = useCallback(() => {
    if (processedImage) {
      downloadImage(processedImage, 'watermark-removed.png')
    }
  }, [processedImage])

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">算法版本</p>
            <p>当前使用基于图像修复算法的去水印功能，自动检测并修复常见水印位置（如右下角）。适用于大多数简单水印场景。</p>
          </div>
        </div>
      </div>

      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传需要去水印的图片</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">原始图片</h3>
              <img 
                src={selectedImage} 
                alt="原始图片" 
                className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => setFullscreenImage(selectedImage)}
                title="点击查看全屏"
              />
            </div>
            {processedImage && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">处理后</h3>
                <img 
                  src={processedImage} 
                  alt="处理后" 
                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={() => setFullscreenImage(processedImage)}
                  title="点击查看全屏"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '处理中...' : '开始处理'}
            </button>
            {processedImage && (
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载
              </button>
            )}
            <button
              onClick={() => setSelectedImage(null)}
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
          images={processedImage ? [selectedImage!, processedImage] : [selectedImage!]}
          currentIndex={fullscreenImage === selectedImage ? 0 : 1}
          onNavigate={(index) => setFullscreenImage(index === 0 ? selectedImage : processedImage)}
        />
      )}
    </div>
  )
}

export default WatermarkRemover
