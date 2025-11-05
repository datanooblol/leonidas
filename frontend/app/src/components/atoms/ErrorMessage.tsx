interface ErrorMessageProps {
  message?: string
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => 
  message ? (
    <div className="text-red-600 dark:text-red-400 text-sm">
      {message}
    </div>
  ) : null