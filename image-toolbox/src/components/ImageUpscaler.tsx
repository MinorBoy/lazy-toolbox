import React, { useState, useCallback } from 'react'
import { Upload, Download, Info } from 'lucide-react'
import { fileToBase64, upscaleImage, downloadImage } from '../utils/imageProcessing'

interface ImageUpscalerProps {
  onComplete?: () => void
}

const ImageUpscaler: React.FC<ImageUpscalerProps> = ({ onComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [scale, setScale] = useState<2 | 4 | 8>(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      // 使用双三次插值算法进行图片放大
      const processed = await upscaleImage(selectedImage, scale)
      setProcessedImage(processed)
    } catch (err: any) {
      setError(err.message || '处理失败')
    } finally {
      setLoading(false)
    }
  }, [selectedImage, scale])

  const handleDownload = useCallback(() => {
    if (processedImage) {
      downloadImage(processedImage, `upscaled-${scale}x.png`)
    }
  }, [processedImage, scale])

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">算法版本</p>
            <p>当前使用双三次插值算法进行图片放大，并应用锐化滤镜增强细节。支持2x、4x、8x放大，适用于大多数图片放大场景。</p>
          </div>
        </div>
      </div>

      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传需要放大的图片</p>
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
              <img src={selectedImage} alt="原始图片" className="w-full rounded-lg" />
            </div>
            {processedImage && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">放大后 ({scale}x)</h3>
                <div className="overflow-auto max-h-96">
                  <img src={processedImage} alt="放大后" className="w-full rounded-lg" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-4">放大倍数</h3>
            <div className="flex gap-4">
              {[2, 4, 8].map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    setScale(value as 2 | 4 | 8)
                    setProcessedImage(null)
                  }}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                    scale === value
                      ? 'bg-purple-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
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
              {loading ? '处理中...' : '开始放大'}
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
              onClick={() => {
                setSelectedImage(null)
                setProcessedImage(null)
              }}
              className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              重新选择
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpscaler
