import React, { useState, useCallback } from 'react'
import { Image as ImageIcon, Wand2, ZoomIn, Info, XCircle, Type } from 'lucide-react'
import WatermarkRemover from './components/WatermarkRemover'
import TextWatermarkRemover from './components/TextWatermarkRemover'
import ImageEditor from './components/ImageEditor'
import ImageUpscaler from './components/ImageUpscaler'
import MetadataViewer from './components/MetadataViewer'
import MetadataRemover from './components/MetadataRemover'

type Tool = 'upload' | 'watermark' | 'text-watermark' | 'editor' | 'upscaler' | 'metadata-view' | 'metadata-remove'

interface ToolConfig {
  id: Tool
  name: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<{ onComplete?: () => void }>
}

const tools: ToolConfig[] = [
  {
    id: 'watermark',
    name: '图片去水印',
    description: '智能去除图片中的水印',
    icon: <Wand2 className="w-6 h-6" />,
    component: WatermarkRemover,
  },
  {
    id: 'text-watermark',
    name: '图片去文字水印',
    description: '专门去除文字水印，保持背景纹理',
    icon: <Type className="w-6 h-6" />,
    component: TextWatermarkRemover,
  },
  {
    id: 'editor',
    name: '图片编辑',
    description: '裁剪、旋转、滤镜、格式转换',
    icon: <ImageIcon className="w-6 h-6" />,
    component: ImageEditor,
  },
  {
    id: 'upscaler',
    name: '图片高清放大',
    description: 'AI智能放大，保持清晰度',
    icon: <ZoomIn className="w-6 h-6" />,
    component: ImageUpscaler,
  },
  {
    id: 'metadata-view',
    name: '元数据查看器',
    description: '查看图片的EXIF信息',
    icon: <Info className="w-6 h-6" />,
    component: MetadataViewer,
  },
  {
    id: 'metadata-remove',
    name: '元数据清除',
    description: '批量清除图片元数据',
    icon: <XCircle className="w-6 h-6" />,
    component: MetadataRemover,
  },
]

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  const handleToolComplete = useCallback(() => {
    setSelectedTool(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                懒人图片工具箱
              </h1>
            </div>
            {selectedTool && (
              <button
                onClick={() => {
                  setSelectedTool(null)
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                返回工具列表
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!selectedTool ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                强大的图片处理工具集
              </h2>
              <p className="text-gray-400 text-lg">
                选择下方工具开始处理您的图片
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {(() => {
              const tool = tools.find((t) => t.id === selectedTool)
              if (!tool) return null
              const ToolComponent = tool.component
              return (
                <div>
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">{tool.name}</h2>
                    <p className="text-gray-400">{tool.description}</p>
                  </div>
                  <ToolComponent onComplete={handleToolComplete} />
                </div>
              )
            })()}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-700 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>懒人图片工具箱 - 让图片处理更简单</p>
        </div>
      </footer>
    </div>
  )
}

export default App
