import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emergencyApi, alertApi } from '@/lib/api';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { roleName } from '@/lib/utils';
import { Incident, MissingPersonAlert } from '@/types';
import { AlertCircle, Users, Clock, CheckCircle } from 'lucide-react';

export default async function ResponderDashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;
  const userRole = session?.user.role;

  let incidentsRes: { data?: { items: Incident[] } } = { data: { items: [] } };
  let alertsRes: { data?: { items: MissingPersonAlert[] } } = { data: { items: [] } };

  try {
    [incidentsRes, alertsRes] = await Promise.all([
      emergencyApi.incidents(token ?? ''),
      alertApi.list(token ?? ''),
    ]);
  } catch {
    // fallback when backend is offline
  }

  const incidents = incidentsRes.data?.items ?? [];
  const alerts = alertsRes.data?.items ?? [];
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Cancelled');
  const pendingIncidents = incidents.filter(i => i.status === 'Pending');
  const openAlerts = alerts.filter(a => a.status === 'Open');
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Responder Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session?.user.name}. You are logged in as <span className="font-semibold">{roleName(userRole || 'responder')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 font-medium uppercase tracking-wide">Active Incidents</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{activeIncidents.length}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{pendingIncidents.length}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">Missing Persons</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{openAlerts.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Resolved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{resolvedIncidents.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Incident Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Incident Queue</CardTitle>
              <Badge variant={activeIncidents.length > 0 ? 'destructive' : 'success'}>
                {activeIncidents.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeIncidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No active incidents right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeIncidents.slice(0, 6).map(incident => (
                  <div key={incident.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{incident.patientName ?? 'Unknown patient'}</p>
                        <p className="text-xs text-muted-foreground">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p>
                      </div>
                      <Badge variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                        {incident.reportType}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <p className="font-medium text-slate-700">Assigned</p>
                        <p className={incident.assignedOfficerName ? 'text-green-600' : 'text-red-600 font-medium'}>
                          {incident.assignedOfficerName ?? 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Status</p>
                        <p>{incident.status}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{formatElapsed(incident.createdAt)}</div>
                  </div>
                ))}
                {activeIncidents.length > 6 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    +{activeIncidents.length - 6} more incidents
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Missing Person Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Missing Person Alerts</CardTitle>
              <Badge variant={openAlerts.length > 0 ? 'destructive' : 'success'}>
                {openAlerts.length} open
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {openAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No open missing-person alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openAlerts.slice(0, 6).map(alert => (
                  <div key={alert.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{alert.fullName}</p>
                        <p className="text-xs text-muted-foreground">Last seen: {alert.lastSeenAreaText ?? 'Unknown location'}</p>
                      </div>
                      <Badge variant="destructive">{alert.status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 line-clamp-2">{alert.description}</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>👁️ {alert.sightingCount} sighting{alert.sightingCount !== 1 ? 's' : ''}</span>
                      <span>{formatElapsed(alert.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {openAlerts.length > 6 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    +{openAlerts.length - 6} more alerts
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
