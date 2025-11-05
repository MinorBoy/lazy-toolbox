import React, { useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageFullscreenViewerProps {
  imageUrl: string
  onClose: () => void
  images?: string[] // 支持多图导航
  currentIndex?: number
  onNavigate?: (newIndex: number) => void
}

const ImageFullscreenViewer: React.FC<ImageFullscreenViewerProps> = ({
  imageUrl,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate,
}) => {
  const [scale, setScale] = useState(1)
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasMultipleImages && currentIndex > 0 && onNavigate) {
        onNavigate(currentIndex - 1)
        setScale(1)
      } else if (e.key === 'ArrowRight' && hasMultipleImages && currentIndex < images.length - 1 && onNavigate) {
        onNavigate(currentIndex + 1)
        setScale(1)
      } else if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(prev + 0.2, 3))
      } else if (e.key === '-') {
        setScale(prev => Math.max(prev - 0.2, 0.5))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [onClose, hasMultipleImages, currentIndex, images.length, onNavigate])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1)
      setScale(1)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1)
      setScale(1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* 工具栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          {hasMultipleImages && (
            <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomOut()
            }}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            title="缩小 (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-lg min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomIn()
            }}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            title="放大 (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors ml-2"
            title="关闭 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 图片容器 */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="全屏预览"
          className="transition-transform duration-200"
          style={{
            transform: `scale(${scale})`,
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 导航按钮 */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="上一张 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="下一张 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 提示信息 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-4 py-2 rounded-full">
        ESC 关闭 | +/- 缩放{hasMultipleImages ? ' | ←/→ 切换图片' : ''}
      </div>
    </div>
  )
}

export default ImageFullscreenViewer
