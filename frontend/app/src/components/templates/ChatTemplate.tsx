interface ChatTemplateProps {
  sidebar: React.ReactNode
  chatArea: React.ReactNode
}

export const ChatTemplate = ({ sidebar, chatArea }: ChatTemplateProps) => (
  <div className="flex h-screen bg-white overflow-hidden">
    {sidebar}
    {chatArea}
  </div>
)