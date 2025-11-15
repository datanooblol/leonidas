import { MessageList } from './MessageList'
import { ChatInput } from '../molecules/ChatInput'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatContainerProps {
  messages: Message[]
  input: string
  isLoading: boolean
  sessionId: string | null
  onInputChange: (value: string) => void
  onSendMessage: () => void
}

export const ChatContainer = ({
  messages,
  input,
  isLoading,
  sessionId,
  onInputChange,
  onSendMessage
}: ChatContainerProps) => {
  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            เลือก Session เพื่อเริ่มแชท
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            สร้าง session ใหม่หรือเลือกจาก session ที่มีอยู่
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        chatWithData={true}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput
          value={input}
          onChange={onInputChange}
          onSend={onSendMessage}
          placeholder="พิมพ์ข้อความของคุณ..."
          disabled={isLoading}
        />
      </div>
    </div>
  )
}