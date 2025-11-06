interface IconProps {
  type: 'folder'
  className?: string
}

export const Icon = ({ type, className = '' }: IconProps) => (
  <span className={`text-4xl ${className}`}>
    📁
  </span>
)