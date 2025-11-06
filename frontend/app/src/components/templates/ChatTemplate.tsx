interface ChatTemplateProps {
  sidebar: React.ReactNode
  chatArea: React.ReactNode
}

export const ChatTemplate = ({ sidebar, chatArea }: ChatTemplateProps) => (
  <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
    {sidebar}
    {chatArea}
  </div>
)