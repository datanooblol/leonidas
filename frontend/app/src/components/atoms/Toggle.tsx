interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  disabled?: boolean
}

export const Toggle = ({ enabled, onChange, label, disabled = false }: ToggleProps) => (
  <div className="flex items-center space-x-3">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)