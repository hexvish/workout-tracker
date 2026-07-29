import React from 'react';
import { LayoutDashboard, PlayCircle, BarChart3, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'logger' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isWorkoutActive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, isWorkoutActive }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'logger', label: 'Workout', icon: <PlayCircle className="w-5 h-5" />, badge: isWorkoutActive },
    { id: 'analytics', label: 'Graphs', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#111114]/95 border-t border-white/5 backdrop-blur-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-zinc-500 font-medium hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

