'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Shield, AlertTriangle, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { cn, roleName } from '@/lib/utils';

const NAV = [
  { href: '/responder', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/responder/incidents', label: 'Active Incidents', icon: AlertTriangle },
  { href: '/responder/missing-persons', label: 'Missing Persons', icon: Search },
];

const ROLE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  medical_officer: {
    bg: 'bg-red-500/20',
    text: 'text-red-200',
    badge: 'bg-red-600',
  },
  security_officer: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-200',
    badge: 'bg-blue-600',
  },
  admin: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-200',
    badge: 'bg-purple-600',
  },
};

export function ResponderSidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const pathname = usePathname();
  const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.admin;

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-950 text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-300" />
          <span className="font-bold text-lg">Nexum</span>
        </div>
        <div className={cn('text-xs mt-2 px-2 py-1 rounded font-medium w-fit', roleColor.bg, roleColor.text)}>
          {roleName(user.role)}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'bg-white/15 text-white font-medium shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-3">
        <div className={cn('p-3 rounded-lg', roleColor.bg)}>
          <div className="text-sm font-semibold text-white truncate">{user.name}</div>
          <div className="text-xs text-slate-300 truncate mt-0.5">{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors px-3 py-2 rounded-lg"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
