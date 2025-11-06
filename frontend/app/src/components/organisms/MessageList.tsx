import { useRef, useEffect } from 'react'
import { ChatMessage } from '../molecules/ChatMessage'
import { EmptyChat } from '../molecules/EmptyChat'
import { LoadingDots } from '../atoms/LoadingDots'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  chatWithData: boolean
}

export const MessageList = ({ messages, isLoading, chatWithData }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
      {messages.length === 0 ? (
        <EmptyChat chatWithData={chatWithData} />
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <LoadingDots />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}