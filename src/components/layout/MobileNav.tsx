import React from 'react';
import { LayoutDashboard, CheckSquare, Layers, Users, Bell, Menu } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface Props {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<Props> = ({ activeTab, onSelectTab, onOpenMenu }) => {
  const { unreadCount } = useNotifications();

  const standardTabs = ['dashboard', 'tasks', 'programs', 'crm', 'notifications'];
  const isExtendedMenuTab = !standardTabs.includes(activeTab);

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'programs', label: 'Program', icon: Layers },
    { id: 'crm', label: 'Donatur', icon: Users },
    { id: 'notifications', label: 'Notif', icon: Bell, badge: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around md:hidden shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition ${
              isActive ? 'text-[#173D32] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#173D32]' : 'text-slate-500'}`} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* Extended Menu Trigger Button */}
      <button
        onClick={onOpenMenu}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition ${
          isExtendedMenuTab ? 'text-[#173D32] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="Buka semua menu yayasan"
      >
        <div className="relative">
          <Menu className={`w-5 h-5 ${isExtendedMenuTab ? 'text-[#173D32]' : 'text-slate-500'}`} />
          {isExtendedMenuTab && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>
        <span className="text-[10px] mt-0.5 leading-none">Menu</span>
      </button>
    </nav>
  );
};
