interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = ({ className = '', children, ...props }: LabelProps) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </label>
)