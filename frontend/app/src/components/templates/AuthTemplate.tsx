import { Heading } from '../atoms/Heading'

interface AuthTemplateProps {
  title: string
  children: React.ReactNode
}

export const AuthTemplate = ({ title, children }: AuthTemplateProps) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <Heading>{title}</Heading>
      </div>
      {children}
    </div>
  </div>
)