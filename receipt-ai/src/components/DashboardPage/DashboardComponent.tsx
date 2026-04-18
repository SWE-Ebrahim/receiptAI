import { useState } from 'react'
import HomeView from './HomeView'
import ScanView from './ScanView'
import HistoryView from './HistoryView'
import GroupsView from './GroupsView'
import SettingsView from './SettingsView'
import BottomNav from './BottomNav'

/**
 * Dashboard Component
 * 
 * Main dashboard with bottom navigation
 * Features 5 tabs: Home, Scan, History, Groups, Settings
 */
const DashboardComponent = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'history' | 'groups' | 'settings'>('home')

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home': return (
        <HomeView 
          onNavigateToSettings={() => setActiveTab('settings')}
          onNavigateToScan={() => setActiveTab('scan')}
          onNavigateToHistory={() => setActiveTab('history')}
          onNavigateToGroups={() => setActiveTab('groups')}
        />
      )
      case 'scan': return <ScanView />
      case 'history': return <HistoryView />
      case 'groups': return <GroupsView />
      case 'settings': return <SettingsView />
      default: return (
        <HomeView 
          onNavigateToSettings={() => setActiveTab('settings')}
          onNavigateToScan={() => setActiveTab('scan')}
          onNavigateToHistory={() => setActiveTab('history')}
          onNavigateToGroups={() => setActiveTab('groups')}
        />
      )
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      <main className="min-h-screen">
        {renderActiveView()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default DashboardComponent
