interface BadgeProps {
  count: number
  text: string
  variant?: 'blue' | 'green' | 'red'
}

export const Badge = ({ count, text, variant = 'blue' }: BadgeProps) => {
  const variants = {
    blue: 'bg-gray-100 text-gray-800',
    green: 'bg-green-50 text-green-800',
    red: 'bg-red-50 text-red-800'
  }

  return (
    <div className={`p-3 rounded-lg ${variants[variant]}`}>
      <p className="text-sm">
        {text} {count} ไฟล์
      </p>
    </div>
  )
}