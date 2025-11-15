import { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
}

export const CopyButton = ({ text, className = '' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-xs transition-opacity ${className}`}
      title="Copy code"
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}