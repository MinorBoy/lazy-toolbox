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


// 图像修复算法 - 用于去水印
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
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // 如果指定了区域，只修复该区域；否则尝试自动检测
      const regionToRepair = region || autoDetectWatermarkRegion(imageData)

      if (regionToRepair) {
        // 使用基于周边像素的修复算法
        inpaintRegion(data, canvas.width, canvas.height, regionToRepair)
      } else {
        // 应用降噪滤镜来淡化水印
        applyDenoiseFilter(data, canvas.width, canvas.height)
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

// 自动检测可能的水印区域（简化版）
function autoDetectWatermarkRegion(imageData: ImageData): { x: number; y: number; width: number; height: number } | null {
  const { width, height } = imageData
  
  // 检测图片右下角区域（水印常见位置）
  const cornerSize = Math.min(width, height) * 0.2
  return {
    x: Math.floor(width - cornerSize),
    y: Math.floor(height - cornerSize),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize)
  }
}

// 图像修复算法 - 基于周边像素填充
function inpaintRegion(data: Uint8ClampedArray, width: number, height: number, region: { x: number; y: number; width: number; height: number }) {
  const { x: rx, y: ry, width: rw, height: rh } = region
  const radius = 5 // 采样半径

  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue

      let r = 0, g = 0, b = 0, count = 0

      // 从周边像素采样
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          const ny = y + dy

          // 只采样区域外的像素
          if (nx >= rx && nx < rx + rw && ny >= ry && ny < ry + rh) continue
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          const idx = (ny * width + nx) * 4
          r += data[idx]
          g += data[idx + 1]
          b += data[idx + 2]
          count++
        }
      }

      if (count > 0) {
        const idx = (y * width + x) * 4
        data[idx] = r / count
        data[idx + 1] = g / count
        data[idx + 2] = b / count
        // alpha保持不变
      }
    }
  }
}

// 降噪滤镜 - 用于淡化水印
function applyDenoiseFilter(data: Uint8ClampedArray, width: number, height: number) {
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

// 去除文字水印 - 使用边缘检测和修复
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
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // 检测文字区域（简化的边缘检测）
      const textRegions = detectTextRegions(data, canvas.width, canvas.height)

      // 修复每个文字区域
      textRegions.forEach(region => {
        inpaintRegion(data, canvas.width, canvas.height, region)
      })

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageData
  })
}

// 简化的文字区域检测
function detectTextRegions(data: Uint8ClampedArray, width: number, height: number): Array<{ x: number; y: number; width: number; height: number }> {
  // 这里返回常见水印位置作为示例
  // 实际应用中可以使用更复杂的边缘检测算法
  const regions = []
  
  // 右下角
  const cornerSize = Math.min(width, height) * 0.15
  regions.push({
    x: Math.floor(width - cornerSize),
    y: Math.floor(height - cornerSize),
    width: Math.floor(cornerSize),
    height: Math.floor(cornerSize)
  })

  return regions
}

// 图片高清放大 - 双三次插值算法
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

      // 双三次插值放大
      const dstImageData = bicubicInterpolation(srcImageData, dstWidth, dstHeight)
      dstCtx.putImageData(dstImageData, 0, 0)

      // 应用锐化滤镜增强细节
      const sharpened = applySharpenFilter(dstCanvas)

      resolve(sharpened)
    }
    img.onerror = reject
    img.src = imageData
  })
}

// 双三次插值实现
function bicubicInterpolation(srcImageData: ImageData, dstWidth: number, dstHeight: number): ImageData {
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

  for (let dstY = 0; dstY < dstHeight; dstY++) {
    for (let dstX = 0; dstX < dstWidth; dstX++) {
      const srcX = dstX * scaleX
      const srcY = dstY * scaleY

      // 使用双线性插值作为双三次的近似（性能优化）
      const x1 = Math.floor(srcX)
      const y1 = Math.floor(srcY)
      const x2 = Math.min(x1 + 1, srcWidth - 1)
      const y2 = Math.min(y1 + 1, srcHeight - 1)

      const dx = srcX - x1
      const dy = srcY - y1

      for (let c = 0; c < 4; c++) {
        const idx11 = (y1 * srcWidth + x1) * 4 + c
        const idx21 = (y1 * srcWidth + x2) * 4 + c
        const idx12 = (y2 * srcWidth + x1) * 4 + c
        const idx22 = (y2 * srcWidth + x2) * 4 + c

        const v11 = srcData[idx11]
        const v21 = srcData[idx21]
        const v12 = srcData[idx12]
        const v22 = srcData[idx22]

        const v1 = v11 * (1 - dx) + v21 * dx
        const v2 = v12 * (1 - dx) + v22 * dx
        const v = v1 * (1 - dy) + v2 * dy

        const dstIdx = (dstY * dstWidth + dstX) * 4 + c
        dstData[dstIdx] = Math.round(v)
      }
    }
  }

  return dstImageData
}

// 锐化滤镜
function applySharpenFilter(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 锐化卷积核
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
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
  return canvas.toDataURL('image/png')
}
