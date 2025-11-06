interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = ({ variant = 'primary', className = '', children, ...props }: ButtonProps) => {
  const baseClass = "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
  
  const variants = {
    primary: "border-transparent text-white bg-gray-600 hover:bg-gray-700",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
  }
  
  return (
    <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}