import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModelSelectorProps {
  selectedModel: string
  models: string[]
  onModelChange: (model: string) => void
  disabled?: boolean
}

export function ModelSelector({ selectedModel, models, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const formatModelName = (model: string) => {
    return model.replace(/_/g, ' ').replace(/BR$/, '').replace(/LC$/, '').trim()
  }

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.top - 128, // dropdown height
        left: rect.left
      })
    }
  }, [isOpen])

  const dropdown = isOpen ? createPortal(
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      <div 
        className="fixed w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-32 overflow-y-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left
        }}
      >
        {models.map((model) => (
          <button
            key={model}
            onClick={() => {
              onModelChange(model)
              setIsOpen(false)
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
              model === selectedModel ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <span className="text-xs">🤖</span>
            <div className="flex-1">
              <div className="font-medium">{formatModelName(model)}</div>
              <div className="text-xs text-gray-500">{model}</div>
            </div>
            {model === selectedModel && <span className="text-blue-500">✓</span>}
          </button>
        ))}
      </div>
    </>,
    document.body
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
      >
        <span className="text-xs text-gray-500">🤖</span>
        <span className="flex-1 text-left truncate">{formatModelName(selectedModel)}</span>
        <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>
      {dropdown}
    </>
  )
}