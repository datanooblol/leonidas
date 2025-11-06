import { MarkdownRenderer } from '../organisms/MarkdownRenderer'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface ChatMessageProps {
  message: Message
}

export const ChatMessage = ({ message }: ChatMessageProps) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-3xl px-4 py-3 rounded-lg ${
        message.role === 'user'
          ? 'bg-gray-800 text-white'
          : 'bg-white text-gray-900 border border-gray-300'
      }`}
    >
      {message.role === 'assistant' ? (
        <>
          <MarkdownRenderer content={message.content} />
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.artifacts.map((artifact, idx) => (
                <details key={idx} className="border border-gray-200 dark:border-gray-600 rounded">
                  <summary className="cursor-pointer p-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium">
                    {artifact.type === 'sql' ? '🗄️ SQL Query' : `📊 ${artifact.type || 'Artifact'}`}
                  </summary>
                  <div className="p-2">
                    {artifact.type === 'sql' ? (
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                        <code>{artifact.content}</code>
                      </pre>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(artifact, null, 2)}
                      </pre>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="whitespace-pre-wrap">{message.content}</p>
      )}
      <p className={`text-xs mt-2 ${
        message.role === 'user' ? 'text-gray-200' : 'text-gray-600'
      }`}>
        {message.timestamp.toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </p>
    </div>
  </div>
)