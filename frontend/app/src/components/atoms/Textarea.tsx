interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ className = '', ...props }: TextareaProps) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 ${className}`}
    {...props}
  />
)