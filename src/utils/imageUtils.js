export const MAX_IMAGE_SIZE_BYTES = 1024 * 1024 // 1MB

export function validateImageFile(file) {
  if (!file) {
    throw new Error('Please select an image file.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size must be 1MB or less.')
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unexpected image conversion result.'))
    }

    reader.onerror = () => {
      reject(new Error('Could not read the selected image file.'))
    }

    reader.readAsDataURL(file)
  })
}
