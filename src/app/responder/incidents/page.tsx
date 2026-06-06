import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emergencyApi } from '@/lib/api';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { Clock, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

export default async function ResponderIncidentsPage() {
  const session = await getServerSession(authOptions);
  let incidents: any[] = [];
  try {
    const res = await emergencyApi.incidents(session!.accessToken);
    incidents = res.data?.items ?? [];
  } catch {
    // backend offline
  }

  const active = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Cancelled');
  const pending = incidents.filter(i => i.status === 'Pending');
  const dispatched = incidents.filter(i => i.status === 'Dispatched');
  const enRoute = incidents.filter(i => i.status === 'EnRoute');
  const resolved = incidents.filter(i => i.status === 'Resolved');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { badge: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' };
      case 'Dispatched':
        return { badge: 'warning' as const, icon: Clock, color: 'text-orange-600' };
      case 'EnRoute':
        return { badge: 'warning' as const, icon: MapPin, color: 'text-blue-600' };
      case 'Resolved':
        return { badge: 'success' as const, icon: CheckCircle, color: 'text-green-600' };
      default:
        return { badge: 'secondary' as const, icon: AlertCircle, color: 'text-slate-600' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Incident Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track active emergency incidents</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 font-medium uppercase">Pending</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{pending.length}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium uppercase">Dispatched</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{dispatched.length}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium uppercase">En Route</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{enRoute.length}</p>
              </div>
              <MapPin className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium uppercase">Resolved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{resolved.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <div className="space-y-6">
        {/* Pending & Active Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Active Incidents ({active.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {active.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No active incidents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {active.map(incident => {
                  const statusInfo = getStatusColor(incident.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={incident.id} className="rounded-lg border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900">{incident.patientName ?? 'Unknown Patient'}</h3>
                            <Badge variant={statusInfo.badge}>{incident.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.reportType} · {formatElapsed(incident.createdAt)}</p>
                        </div>
                        <div className={statusInfo.color}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                        <div className="bg-slate-50 rounded p-3">
                          <p className="font-medium text-slate-700">Location</p>
                          <p className="text-xs text-muted-foreground mt-1">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p>
                        </div>
                        <div className="bg-slate-50 rounded p-3">
                          <p className="font-medium text-slate-700">Assigned Officer</p>
                          <p className={`text-xs mt-1 font-medium ${incident.assignedOfficerName ? 'text-green-600' : 'text-red-600'}`}>
                            {incident.assignedOfficerName ?? 'Unassigned'}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded p-3">
                          <p className="font-medium text-slate-700">Report Type</p>
                          <Badge className="mt-1" variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                            {incident.reportType}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 rounded p-3">
                          <p className="font-medium text-slate-700">Created</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(incident.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {incident.description && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-900">Description</p>
                          <p className="text-sm text-blue-700 mt-1">{incident.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical/Resolved Incidents */}
        {resolved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resolved Incidents ({resolved.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolved.slice(0, 10).map(incident => (
                  <div key={incident.id} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{incident.patientName ?? 'Unknown Patient'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{incident.reportType} · {formatElapsed(incident.createdAt)}</p>
                      </div>
                      <Badge variant="success">Resolved</Badge>
                    </div>
                  </div>
                ))}
                {resolved.length > 10 && (
                  <p className="text-center text-xs text-muted-foreground py-3">+{resolved.length - 10} more resolved incidents</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
