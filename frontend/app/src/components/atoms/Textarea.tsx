interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ className = '', ...props }: TextareaProps) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white ${className}`}
    {...props}
  />
)