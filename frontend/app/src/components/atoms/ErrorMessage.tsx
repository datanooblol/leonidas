interface ErrorMessageProps {
  message?: string
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => 
  message ? (
    <div className="text-red-600 text-sm">
      {message}
    </div>
  ) : null