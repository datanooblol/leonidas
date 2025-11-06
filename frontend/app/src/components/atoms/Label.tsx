interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = ({ className = '', children, ...props }: LabelProps) => (
  <label className={`block text-sm font-medium text-gray-900 ${className}`} {...props}>
    {children}
  </label>
)