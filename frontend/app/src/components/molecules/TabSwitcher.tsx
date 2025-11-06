interface TabSwitcherProps {
  activeTab: 'files' | 'sessions'
  onTabChange: (tab: 'files' | 'sessions') => void
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => (
  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
    <button
      onClick={() => onTabChange('files')}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === 'files'
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      📁 ไฟล์
    </button>
    <button
      onClick={() => onTabChange('sessions')}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === 'sessions'
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      💬 Sessions
    </button>
  </div>
)