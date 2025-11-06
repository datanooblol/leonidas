import { Button } from '../atoms/Button'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder: string
  disabled?: boolean
}

export const ChatInput = ({ value, onChange, onSend, placeholder, disabled = false }: ChatInputProps) => (
  <div className="flex space-x-3">
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
      className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      rows={1}
      disabled={disabled}
    />
    <Button
      onClick={onSend}
      disabled={!value.trim() || disabled}
      className="w-auto px-6 py-3"
    >
      ส่ง
    </Button>
  </div>
)