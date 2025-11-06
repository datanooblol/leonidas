interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const Card = ({ children, onClick, className = '' }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-lg border border-gray-300 p-6 ${onClick ? 'hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all' : ''} ${className}`}
  >
    {children}
  </div>
)