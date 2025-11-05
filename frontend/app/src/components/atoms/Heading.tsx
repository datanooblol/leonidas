interface HeadingProps {
  children: React.ReactNode
  className?: string
}

export const Heading = ({ children, className = '' }: HeadingProps) => (
  <h2 className={`text-3xl font-bold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h2>
)