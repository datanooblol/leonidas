interface BadgeProps {
  count: number
  text: string
  variant?: 'blue' | 'green' | 'red'
}

export const Badge = ({ count, text, variant = 'blue' }: BadgeProps) => {
  const variants = {
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    green: 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200',
    red: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
  }

  return (
    <div className={`p-3 rounded-lg ${variants[variant]}`}>
      <p className="text-sm">
        {text} {count} ไฟล์
      </p>
    </div>
  )
}