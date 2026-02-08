import { Flame, MessageCircle, User, Settings } from "lucide-react";

export type View = 'discovery' | 'messages' | 'settings';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

export function Navigation({ currentView, setView }: NavigationProps) {
  const navItems = [
    { id: 'discovery', icon: Flame, label: 'Discover' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 md:top-0 md:left-0 md:bottom-0 md:w-20 md:flex-col md:border-t-0 md:border-r">
      <div className="hidden md:flex mb-8 text-pink-500">
        <Flame size={32} fill="currentColor" />
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as View)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === item.id ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
        </button>
      ))}

      <div className="hidden md:block mt-auto">
        <button 
          onClick={() => setView('settings')}
          className="text-gray-400 hover:text-gray-600"
        >
          <Settings size={24} />
        </button>
      </div>
    </nav>
  );
}
