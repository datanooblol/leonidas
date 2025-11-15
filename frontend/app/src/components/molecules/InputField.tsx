import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const InputField = ({ label, ...props }: InputFieldProps) => (
  <div>
    <Label>{label}</Label>
    <Input {...props} />
  </div>
)