import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, PencilLine, Trophy, MessageCircle, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tab {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/learning', labelKey: 'nav.learning', icon: BookOpen },
  { to: '/test', labelKey: 'nav.test', icon: PencilLine },
  { to: '/league', labelKey: 'nav.league', icon: Trophy },
  { to: '/community', labelKey: 'nav.community', icon: MessageCircle },
  { to: '/profile', labelKey: 'nav.profile', icon: User },
];

export default function TabBar() {
  const { t } = useTranslation();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-mobile -translate-x-1/2 border-t border-line bg-white/80 backdrop-blur-lg">
      <ul className="flex h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-ink-faint'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
                    <span>{t(tab.labelKey)}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
