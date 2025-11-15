import { Button } from '../atoms/Button'
import { ModelSelector } from './ModelSelector'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder: string
  disabled?: boolean
  useFileData?: boolean
  onToggleFileData?: () => void
  selectedFilesCount?: number
  selectedModel?: string
  availableModels?: string[]
  onModelChange?: (model: string) => void
}

export const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  placeholder, 
  disabled = false,
  useFileData = false,
  onToggleFileData,
  selectedFilesCount = 0,
  selectedModel = "OPENAI_20b_BR",
  availableModels = [],
  onModelChange
}: ChatInputProps) => (
  <div className="space-y-2">
    {/* Chat Input */}
    <div className="flex items-center space-x-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder}
        className="flex-1 resize-none border-0 rounded-lg px-3 py-2 focus:outline-none bg-transparent text-sm h-9 overflow-hidden"
        rows={1}
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center text-white text-sm transition-colors"
      >
        ➤
      </button>
    </div>
    
    {/* Controls */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* File Data Switch */}
        {onToggleFileData && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>ใช้ข้อมูลจากไฟล์</span>
            <button
              onClick={onToggleFileData}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                useFileData ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  useFileData ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}
        
        {/* Model Selector */}
        {availableModels.length > 0 && onModelChange && (
          <ModelSelector
            selectedModel={selectedModel}
            models={availableModels}
            onModelChange={onModelChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  </div>
)