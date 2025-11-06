import { Button } from './Button'

interface NavbarProps {
  projectName: string
  onBack: () => void
}

export const Navbar = ({ projectName, onBack }: NavbarProps) => (
  <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          onClick={onBack}
          variant="secondary"
          className="px-3 py-1 text-sm w-auto"
        >
          ← กลับ
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">
          {projectName}
        </h1>
      </div>
    </div>
  </div>
)