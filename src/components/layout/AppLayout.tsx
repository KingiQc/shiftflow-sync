import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'mdi:view-dashboard' },
  { path: '/calendar', label: 'Calendar', icon: 'mdi:calendar-month' },
  { path: '/insights', label: 'Insights', icon: 'mdi:lightbulb-on' },
  { path: '/jobs', label: 'Jobs', icon: 'mdi:briefcase' },
  { path: '/expenses', label: 'Expenses', icon: 'mdi:cash-multiple' },
  { path: '/settings', label: 'Settings', icon: 'mdi:cog' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-60 md:flex-col glass-card rounded-none border-r border-border/50 z-30">
      <div className="flex items-center gap-2 px-6 py-6">
        <Icon icon="mdi:clock-fast" className="text-primary" width={28} />
        <span className="text-lg font-semibold text-foreground tracking-tight">ShiftTap</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              <Icon icon={item.icon} width={22} className={active ? 'text-primary' : 'text-foreground'} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

const MobileNav: React.FC = () => {
  const location = useLocation();
  const mobileItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-card rounded-none border-t border-border/50">
      <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {mobileItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon icon={item.icon} width={22} className={active ? 'text-primary' : 'text-foreground'} />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background font-poppins">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-60">
        <div className="max-w-4xl mx-auto px-4 py-5 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
