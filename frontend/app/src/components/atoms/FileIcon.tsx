interface FileIconProps {
  type?: string
  className?: string
}

export const FileIcon = ({ type, className = '' }: FileIconProps) => {
  const getIcon = (fileType?: string) => {
    if (!fileType) return '📄'
    
    const lowerType = fileType.toLowerCase()
    if (lowerType.includes('csv') || lowerType.includes('excel')) return '📊'
    if (lowerType.includes('pdf')) return '📕'
    if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return '🖼️'
    if (lowerType.includes('code') || lowerType.includes('py') || lowerType.includes('js')) return '💻'
    return '📄'
  }

  return (
    <span className={`text-lg ${className}`}>
      {getIcon(type)}
    </span>
  )
}