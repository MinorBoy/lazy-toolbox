import React, { useState, useCallback } from 'react'
import { Upload, Download, RotateCw, FlipHorizontal, FlipVertical, Sun, Contrast, Droplets } from 'lucide-react'
import {
  fileToBase64,
  downloadImage,
  rotateImage,
  flipImage,
  adjustImageBrightness,
  adjustImageContrast,
  adjustImageSaturation,
  convertImageFormat,
} from '../utils/imageProcessing'

interface ImageEditorProps {
  onComplete?: () => void
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [loading, setLoading] = useState(false)

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageData = await fileToBase64(file)
      setSelectedImage(imageData)
      setEditedImage(imageData)
    } catch (err) {
      alert('图片加载失败')
    }
  }, [])

  const handleRotate = useCallback(async () => {
    if (!editedImage) return
    setLoading(true)
    try {
      const rotated = await rotateImage(editedImage, 90)
      setEditedImage(rotated)
    } catch (err) {
      alert('旋转失败')
    } finally {
      setLoading(false)
    }
  }, [editedImage])

  const handleFlipHorizontal = useCallback(async () => {
    if (!editedImage) return
    setLoading(true)
    try {
      const flipped = await flipImage(editedImage, 'horizontal')
      setEditedImage(flipped)
    } catch (err) {
      alert('翻转失败')
    } finally {
      setLoading(false)
    }
  }, [editedImage])

  const handleFlipVertical = useCallback(async () => {
    if (!editedImage) return
    setLoading(true)
    try {
      const flipped = await flipImage(editedImage, 'vertical')
      setEditedImage(flipped)
    } catch (err) {
      alert('翻转失败')
    } finally {
      setLoading(false)
    }
  }, [editedImage])

  const applyFilters = useCallback(async () => {
    if (!selectedImage) return
    setLoading(true)
    try {
      let result = selectedImage
      if (brightness !== 100) {
        result = await adjustImageBrightness(result, brightness)
      }
      if (contrast !== 100) {
        result = await adjustImageContrast(result, contrast)
      }
      if (saturation !== 100) {
        result = await adjustImageSaturation(result, saturation)
      }
      setEditedImage(result)
    } catch (err) {
      alert('滤镜应用失败')
    } finally {
      setLoading(false)
    }
  }, [selectedImage, brightness, contrast, saturation])

  const handleDownload = useCallback(async (format: 'png' | 'jpeg' | 'webp') => {
    if (!editedImage) return
    try {
      const converted = await convertImageFormat(editedImage, format)
      downloadImage(converted, `edited-image.${format}`)
    } catch (err) {
      alert('下载失败')
    }
  }, [editedImage])

  return (
    <div className="space-y-6">
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">上传需要编辑的图片</p>
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
            <img src={editedImage || selectedImage} alt="编辑中" className="max-w-full mx-auto rounded-lg" />
          </div>

          <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">基础操作</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRotate}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  旋转90°
                </button>
                <button
                  onClick={handleFlipHorizontal}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  水平翻转
                </button>
                <button
                  onClick={handleFlipVertical}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FlipVertical className="w-4 h-4" />
                  垂直翻转
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">滤镜调整</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <label className="flex-1">亮度: {brightness}%</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Contrast className="w-4 h-4 text-blue-400" />
                    <label className="flex-1">对比度: {contrast}%</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Droplets className="w-4 h-4 text-purple-400" />
                    <label className="flex-1">饱和度: {saturation}%</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={applyFilters}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  应用滤镜
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">下载为</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload('png')}
                  className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => handleDownload('jpeg')}
                  className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JPEG
                </button>
                <button
                  onClick={() => handleDownload('webp')}
                  className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  WebP
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedImage(null)
                setEditedImage(null)
                setBrightness(100)
                setContrast(100)
                setSaturation(100)
              }}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              重新选择
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageEditor
