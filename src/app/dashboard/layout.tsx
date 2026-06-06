import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import type { ResponderType } from '@/lib/auth';

type SidebarRole = 'worshipper' | 'medical' | 'security' | 'driver' | 'admin';

function resolveSidebarRole(role: string, responderType?: ResponderType): SidebarRole {
  if (role === 'admin') return 'admin';
  if (role === 'worshipper') return 'worshipper';
  if (role === 'responder') {
    if (responderType === 'medical') return 'medical';
    if (responderType === 'security') return 'security';
    if (responderType === 'driver') return 'driver';
    return 'medical';
  }
  if (role === 'medical_officer') return 'medical';
  if (role === 'security_officer') return 'security';
  if (role === 'driver') return 'driver';
  return 'worshipper';
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const sidebarRole = resolveSidebarRole(session.user.role, session.user.responderType);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        role={sidebarRole}
        user={{ name: session.user.name, email: session.user.email }}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
