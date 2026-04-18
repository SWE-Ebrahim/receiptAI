interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: 'home' | 'scan' | 'history' | 'groups' | 'settings') => void
}

/**
 * Bottom Navigation Bar
 * 
 * 5-tab navigation: Home, Scan, History, Groups, Settings
 * Active tab is highlighted with background color
 */
const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: 'home', icon: 'grid_view', label: 'Home' },
    { id: 'scan', icon: 'center_focus_strong', label: 'Scan' },
    { id: 'history', icon: 'receipt_long', label: 'History' },
    { id: 'groups', icon: 'category', label: 'Groups' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface/80 backdrop-blur-xl z-50 rounded-t-[2rem] shadow-[0_-20px_40px_rgba(18,28,40,0.06)] border-t border-outline-variant/15">
      {navItems.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 ${
              isActive
                ? 'bg-secondary-container text-primary rounded-full scale-110'
                : 'text-on-surface/50 hover:opacity-80'
            }`}
          >
            <span 
              className="material-symbols-outlined mb-0.5"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[11px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
