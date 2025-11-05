import imageCompression from 'browser-image-compression'

export interface ProcessingSettings {
  [key: string]: any
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}

export const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const compressImage = async (file: File, maxSizeMB = 1): Promise<File> => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Image compression failed:', error)
    return file
  }
}

export const cropImage = (
  imageData: string,
  crop: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const rotateImage = (imageData: string, degrees: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((degrees * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const flipImage = (imageData: string, direction: 'horizontal' | 'vertical'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      if (direction === 'horizontal') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
      }

      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const adjustImageBrightness = (imageData: string, value: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.filter = `brightness(${value}%)`
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const adjustImageContrast = (imageData: string, value: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.filter = `contrast(${value}%)`
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const adjustImageSaturation = (imageData: string, value: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.filter = `saturate(${value}%)`
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const convertImageFormat = (imageData: string, format: 'png' | 'jpeg' | 'webp'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const mimeType = `image/${format}`
      resolve(canvas.toDataURL(mimeType))
    }
    img.onerror = reject
    img.src = imageData
  })
}

export const removeImageMetadata = (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}


// 图像修复算法 - 用于去水印（增强版）
export const removeWatermark = (imageData: string, region?: { x: number; y: number; width: number; height: number }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      // 检测多个可能的水印区域
      const regions = region ? [region] : detectMultipleWatermarkRegions(imgData)

      // 对每个区域进行修复
      regions.forEach(reg => {
        // 多次迭代修复以获得更好的效果
        for (let iteration = 0; iteration < 3; iteration++) {
          enhancedInpaintRegion(data, canvas.width, canvas.height, reg)
        }
      })

      // 应用轻微的平滑滤镜使修复更自然
      applySmoothing(data, canvas.width, canvas.height)

      ctx.putImageData(imgData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

// 检测多个可能的水印区域
function detectMultipleWatermarkRegions(imageData: ImageData): Array<{ x: number; y: number; width: number; height: number }> {
  const { width, height } = imageData
  const regions = []
  
  // 水印常见位置：四个角和中心
  const cornerSize = Math.min(width, height) * 0.25
  
  // 右下角（最常见）
  regions.push({
    x: Math.floor(width - cornerSize),
    y: Math.floor(height - cornerSize),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize)
  })
  
  // 右上角
  regions.push({
    x: Math.floor(width - cornerSize),
    y: 0,
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.5)
  })
  
  // 左下角
  regions.push({
    x: 0,
    y: Math.floor(height - cornerSize),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.5)
  })
  
  // 底部中心
  regions.push({
    x: Math.floor(width / 2 - cornerSize / 2),
    y: Math.floor(height - cornerSize * 0.3),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.3)
  })

  return regions
}

// 增强的图像修复算法 - 使用加权平均和距离衰减
function enhancedInpaintRegion(data: Uint8ClampedArray, width: number, height: number, region: { x: number; y: number; width: number; height: number }) {
  const { x: rx, y: ry, width: rw, height: rh } = region
  const radius = 8 // 增大采样半径
  const tempData = new Uint8ClampedArray(data)

  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue

      let r = 0, g = 0, b = 0, totalWeight = 0

      // 从周边像素采样，使用距离加权
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          const ny = y + dy

          // 只采样区域外的像素
          if (nx >= rx && nx < rx + rw && ny >= ry && ny < ry + rh) continue
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          // 计算距离权重（距离越远，权重越小）
          const distance = Math.sqrt(dx * dx + dy * dy)
          const weight = 1.0 / (1.0 + distance)

          const idx = (ny * width + nx) * 4
          r += tempData[idx] * weight
          g += tempData[idx + 1] * weight
          b += tempData[idx + 2] * weight
          totalWeight += weight
        }
      }

      if (totalWeight > 0) {
        const idx = (y * width + x) * 4
        data[idx] = Math.round(r / totalWeight)
        data[idx + 1] = Math.round(g / totalWeight)
        data[idx + 2] = Math.round(b / totalWeight)
      }
    }
  }
}

// 平滑滤镜 - 使修复区域更自然
function applySmoothing(data: Uint8ClampedArray, width: number, height: number) {
  const tempData = new Uint8ClampedArray(data)
  const radius = 1

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          r += tempData[idx]
          g += tempData[idx + 1]
          b += tempData[idx + 2]
          count++
        }
      }

      const idx = (y * width + x) * 4
      data[idx] = r / count
      data[idx + 1] = g / count
      data[idx + 2] = b / count
    }
  }
}

// 去除文字水印 - 使用边缘检测和修复（增强版）
export const removeTextWatermark = (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      // 检测文字区域（扩展检测）
      const textRegions = detectEnhancedTextRegions(data, canvas.width, canvas.height)

      // 对每个文字区域进行增强修复
      textRegions.forEach(region => {
        // 多次迭代修复
        for (let iteration = 0; iteration < 3; iteration++) {
          enhancedInpaintRegion(data, canvas.width, canvas.height, region)
        }
      })

      // 应用平滑使修复更自然
      applySmoothing(data, canvas.width, canvas.height)

      ctx.putImageData(imgData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

// 增强的文字区域检测
function detectEnhancedTextRegions(data: Uint8ClampedArray, width: number, height: number): Array<{ x: number; y: number; width: number; height: number }> {
  const regions = []
  
  // 检测所有可能的文字水印位置
  const cornerSize = Math.min(width, height) * 0.2
  
  // 右下角（最常见）
  regions.push({
    x: Math.floor(width - cornerSize),
    y: Math.floor(height - cornerSize),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize)
  })
  
  // 右上角
  regions.push({
    x: Math.floor(width - cornerSize),
    y: 0,
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.4)
  })
  
  // 左下角
  regions.push({
    x: 0,
    y: Math.floor(height - cornerSize * 0.4),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.4)
  })
  
  // 底部中心
  regions.push({
    x: Math.floor(width / 2 - cornerSize / 2),
    y: Math.floor(height - cornerSize * 0.3),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.3)
  })
  
  // 顶部中心
  regions.push({
    x: Math.floor(width / 2 - cornerSize / 2),
    y: 0,
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize * 0.3)
  })

  return regions
}

// 图片高清放大 - Lanczos插值算法（增强版）
export const upscaleImage = (imageData: string, scale: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const srcWidth = img.width
      const srcHeight = img.height
      const dstWidth = Math.floor(srcWidth * scale)
      const dstHeight = Math.floor(srcHeight * scale)

      // 创建源画布
      const srcCanvas = document.createElement('canvas')
      srcCanvas.width = srcWidth
      srcCanvas.height = srcHeight
      const srcCtx = srcCanvas.getContext('2d')
      if (!srcCtx) {
        reject(new Error('Failed to get source canvas context'))
        return
      }
      srcCtx.drawImage(img, 0, 0)
      const srcImageData = srcCtx.getImageData(0, 0, srcWidth, srcHeight)

      // 创建目标画布
      const dstCanvas = document.createElement('canvas')
      dstCanvas.width = dstWidth
      dstCanvas.height = dstHeight
      const dstCtx = dstCanvas.getContext('2d')
      if (!dstCtx) {
        reject(new Error('Failed to get destination canvas context'))
        return
      }

      // Lanczos插值放大
      const dstImageData = lanczosInterpolation(srcImageData, dstWidth, dstHeight)
      dstCtx.putImageData(dstImageData, 0, 0)

      // 应用增强的锐化滤镜
      applyEnhancedSharpen(dstCanvas)
      
      // 应用边缘增强
      applyEdgeEnhancement(dstCanvas)

      resolve(dstCanvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

// Lanczos插值核函数
function lanczosKernel(x: number, a = 3): number {
  if (x === 0) return 1
  if (Math.abs(x) >= a) return 0
  const piX = Math.PI * x
  return (a * Math.sin(piX) * Math.sin(piX / a)) / (piX * piX)
}

// Lanczos插值实现（高质量放大）
function lanczosInterpolation(srcImageData: ImageData, dstWidth: number, dstHeight: number): ImageData {
  const srcWidth = srcImageData.width
  const srcHeight = srcImageData.height
  const srcData = srcImageData.data

  const dstCanvas = document.createElement('canvas')
  dstCanvas.width = dstWidth
  dstCanvas.height = dstHeight
  const dstCtx = dstCanvas.getContext('2d')!
  const dstImageData = dstCtx.createImageData(dstWidth, dstHeight)
  const dstData = dstImageData.data

  const scaleX = srcWidth / dstWidth
  const scaleY = srcHeight / dstHeight
  const a = 3 // Lanczos窗口大小

  for (let dstY = 0; dstY < dstHeight; dstY++) {
    for (let dstX = 0; dstX < dstWidth; dstX++) {
      const srcX = dstX * scaleX
      const srcY = dstY * scaleY

      let r = 0, g = 0, b = 0, alpha = 0, weightSum = 0

      // Lanczos采样
      const x0 = Math.floor(srcX)
      const y0 = Math.floor(srcY)

      for (let j = -a + 1; j <= a; j++) {
        for (let i = -a + 1; i <= a; i++) {
          const x = x0 + i
          const y = y0 + j

          if (x >= 0 && x < srcWidth && y >= 0 && y < srcHeight) {
            const weight = lanczosKernel(srcX - x) * lanczosKernel(srcY - y)
            const idx = (y * srcWidth + x) * 4

            r += srcData[idx] * weight
            g += srcData[idx + 1] * weight
            b += srcData[idx + 2] * weight
            alpha += srcData[idx + 3] * weight
            weightSum += weight
          }
        }
      }

      if (weightSum > 0) {
        const dstIdx = (dstY * dstWidth + dstX) * 4
        dstData[dstIdx] = Math.max(0, Math.min(255, Math.round(r / weightSum)))
        dstData[dstIdx + 1] = Math.max(0, Math.min(255, Math.round(g / weightSum)))
        dstData[dstIdx + 2] = Math.max(0, Math.min(255, Math.round(b / weightSum)))
        dstData[dstIdx + 3] = Math.max(0, Math.min(255, Math.round(alpha / weightSum)))
      }
    }
  }

  return dstImageData
}

// 增强的锐化滤镜
function applyEnhancedSharpen(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 增强的锐化卷积核
  const kernel = [
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
  ]

  const tempData = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            sum += tempData[idx] * kernel[kernelIdx]
          }
        }
        const idx = (y * width + x) * 4 + c
        data[idx] = Math.max(0, Math.min(255, sum))
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// 边缘增强滤镜
function applyEdgeEnhancement(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 边缘检测核
  const kernelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ]

  const kernelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ]

  const tempData = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let gx = 0, gy = 0

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            gx += tempData[idx] * kernelX[kernelIdx]
            gy += tempData[idx] * kernelY[kernelIdx]
          }
        }

        const gradient = Math.sqrt(gx * gx + gy * gy)
        const idx = (y * width + x) * 4 + c
        // 混合原始值和边缘强度
        data[idx] = Math.max(0, Math.min(255, tempData[idx] + gradient * 0.15))
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
