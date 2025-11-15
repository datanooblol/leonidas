interface CloseButtonProps {
  onClick: () => void
  className?: string
}

export const CloseButton = ({ onClick, className = '' }: CloseButtonProps) => (
  <button 
    onClick={onClick}
    className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${className}`}
  >
    ✕
  </button>
)