interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const Card = ({ children, onClick, className = '' }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${onClick ? 'hover:shadow-md cursor-pointer transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
)