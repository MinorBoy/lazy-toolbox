import React, { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onImageUpload(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [onImageUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        isDragging
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
          isDragging ? 'bg-purple-500' : 'bg-gray-700'
        }`}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-xl font-semibold mb-2">
            拖拽图片到这里，或点击上传
          </p>
          <p className="text-gray-400 text-sm">
            支持 JPG、PNG、WebP 格式
          </p>
        </div>
        <label className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg font-medium cursor-pointer hover:from-purple-600 hover:to-blue-700 transition-all">
          选择图片
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}

export default ImageUpload
