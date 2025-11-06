import { ChatHeader } from '../molecules/ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from '../molecules/ChatInput'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface ChatAreaProps {
  messages: Message[]
  input: string
  isLoading: boolean
  sidebarOpen: boolean
  chatWithData: boolean
  selectedFilesCount: number
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onToggleSidebar: () => void
  onBack: () => void
}

export const ChatArea = ({
  messages,
  input,
  isLoading,
  sidebarOpen,
  chatWithData,
  selectedFilesCount,
  onInputChange,
  onSendMessage,
  onToggleSidebar,
  onBack
}: ChatAreaProps) => (
  <div className="flex-1 flex flex-col">
    <ChatHeader
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      onBack={onBack}
      chatWithData={chatWithData}
      selectedFilesCount={selectedFilesCount}
    />

    <MessageList
      messages={messages}
      isLoading={isLoading}
      chatWithData={chatWithData}
    />

    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSendMessage}
        placeholder={chatWithData ? "ถามคำถามเกี่ยวกับเอกสารของคุณ..." : "พิมพ์ข้อความของคุณ bro..."}
        disabled={isLoading}
      />
    </div>
  </div>
)