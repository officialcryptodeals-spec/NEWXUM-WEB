'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, TriangleAlert as AlertTriangle, Search, MapPin, Bus, Building2, LogOut, Shield, Heart, ShieldCheck, Truck, Crown, Bell, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarRole = 'worshipper' | 'medical' | 'security' | 'driver' | 'admin';

const NAV_BY_ROLE: Record<SidebarRole, { label: string; items: { href: string; label: string; icon: React.ElementType }[] }[]> = {
  worshipper: [
    { label: 'Overview', items: [
      { href: '/dashboard/worshipper', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Emergency', items: [
      { href: '/dashboard/worshipper#sos', label: 'SOS / Report', icon: AlertTriangle },
    ]},
    { label: 'Services', items: [
      { href: '/dashboard/worshipper#missing', label: 'Missing Persons', icon: Search },
      { href: '/dashboard/worshipper#parking', label: 'Parking Pin', icon: MapPin },
      { href: '/dashboard/worshipper#shuttle', label: 'Shuttle Request', icon: Bus },
      { href: '/dashboard/worshipper#accommodation', label: 'Accommodation', icon: Building2 },
    ]},
  ],
  medical: [
    { label: 'Overview', items: [
      { href: '/dashboard/medical', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/medical#dispatch', label: 'Dispatch Queue', icon: Bell },
      { href: '/dashboard/medical#active', label: 'Active Cases', icon: Heart },
    ]},
  ],
  security: [
    { label: 'Overview', items: [
      { href: '/dashboard/security', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/security#dispatch', label: 'Dispatch Queue', icon: Bell },
      { href: '/dashboard/security#missing', label: 'Missing Persons', icon: Search },
    ]},
  ],
  driver: [
    { label: 'Overview', items: [
      { href: '/dashboard/driver', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/driver#requests', label: 'Pickup Requests', icon: Bus },
      { href: '/dashboard/driver#vehicle', label: 'My Vehicle', icon: Car },
    ]},
  ],
  admin: [
    { label: 'Overview', items: [
      { href: '/dashboard/admin', label: 'Command Center', icon: Crown },
    ]},
    { label: 'Safety', items: [
      { href: '/dashboard/admin#incidents', label: 'Incidents', icon: AlertTriangle },
      { href: '/dashboard/admin#missing', label: 'Missing Persons', icon: Search },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/admin#transit', label: 'Transit', icon: Bus },
      { href: '/dashboard/admin#personnel', label: 'Personnel', icon: ShieldCheck },
    ]},
  ],
};

const ROLE_META: Record<SidebarRole, { label: string; icon: React.ElementType; color: string }> = {
  worshipper: { label: 'Worshipper', icon: Shield, color: 'text-blue-300' },
  medical: { label: 'Medical Officer', icon: Heart, color: 'text-red-300' },
  security: { label: 'Security Officer', icon: ShieldCheck, color: 'text-blue-300' },
  driver: { label: 'Shuttle Driver', icon: Truck, color: 'text-emerald-300' },
  admin: { label: 'Administrator', icon: Crown, color: 'text-amber-300' },
};

export function DashboardSidebar({
  role,
  user,
}: {
  role: SidebarRole;
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const nav = NAV_BY_ROLE[role];
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0B1F4F] text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-300" />
          <span className="font-bold text-lg">Nexum</span>
        </div>
        <div className={cn('flex items-center gap-1.5 mt-1.5 text-xs', meta.color)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {nav.map(group => (
          <div key={group.label} className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-blue-300/70 px-2 mb-1 font-medium">
              {group.label}
            </div>
            {group.items.map(item => {
              const ItemIcon = item.icon;
              const baseHref = item.href.split('#')[0];
              const active = pathname === baseHref;
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                    active
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  )}>
                  <ItemIcon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user.name}</div>
        <div className="text-xs text-blue-300/70 truncate">{user.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-2 flex items-center gap-2 text-xs text-blue-200/70 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
