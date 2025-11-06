interface SpinnerProps {
  text?: string
}

export const Spinner = ({ text = 'Loading...' }: SpinnerProps) => (
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400">{text}</p>
  </div>
)