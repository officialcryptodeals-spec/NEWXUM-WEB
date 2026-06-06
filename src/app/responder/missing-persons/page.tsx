import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { alertApi } from '@/lib/api';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { Users, Search, CheckCircle, Clock } from 'lucide-react';

export default async function ResponderMissingPersonsPage() {
  const session = await getServerSession(authOptions);
  let alerts: any[] = [];
  try {
    const res = await alertApi.list(session!.accessToken);
    alerts = res.data?.items ?? [];
  } catch {
    // backend offline
  }

  const openAlerts = alerts.filter(a => a.status === 'Open');
  const foundAlerts = alerts.filter(a => a.status === 'Found');
  const closedAlerts = alerts.filter(a => a.status === 'Closed');
  const totalSightings = alerts.reduce((sum, a) => sum + (a.sightingCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Missing Person Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and coordinate response for missing person cases</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 font-medium uppercase">Open Alerts</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{openAlerts.length}</p>
              </div>
              <Users className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium uppercase">Found</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{foundAlerts.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium uppercase">Total Sightings</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{totalSightings}</p>
              </div>
              <Search className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-700 font-medium uppercase">Closed</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{closedAlerts.length}</p>
              </div>
              <Clock className="h-10 w-10 text-slate-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            Open Missing Person Cases ({openAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No open missing person cases</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openAlerts.map(alert => (
                <div key={alert.id} className="rounded-lg border border-red-200 bg-red-50/50 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{alert.fullName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="destructive">{alert.status}</Badge>
                        {alert.age && <span className="text-xs text-muted-foreground">Age: {alert.age}</span>}
                        <span className="text-xs text-muted-foreground">{formatElapsed(alert.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{alert.sightingCount}</p>
                      <p className="text-xs text-muted-foreground">sighting{alert.sightingCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
                      <p className="text-sm text-slate-600">{alert.description}</p>
                    </div>

                    {alert.lastSeenAreaText && (
                      <div className="bg-white rounded p-3 border border-red-200">
                        <p className="text-sm font-medium text-slate-700">Last Seen</p>
                        <p className="text-sm text-slate-600 mt-1">{alert.lastSeenAreaText}</p>
                      </div>
                    )}

                    {alert.photoUrl && (
                      <div className="bg-white rounded p-3 border border-red-200">
                        <p className="text-sm font-medium text-slate-700 mb-2">Photo Available</p>
                        <div className="h-32 bg-slate-200 rounded flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">📷 Photo URL: {alert.photoUrl}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Found Cases */}
      {foundAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Found Cases ({foundAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foundAlerts.map(alert => (
                <div key={alert.id} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{alert.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <Badge variant="success">Found</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formatElapsed(alert.createdAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Cases */}
      {closedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Closed Cases ({closedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {closedAlerts.map(alert => (
                <div key={alert.id} className="rounded p-3 bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{alert.fullName}</p>
                      <p className="text-xs text-muted-foreground">{formatElapsed(alert.createdAt)}</p>
                    </div>
                    <Badge variant="secondary">Closed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
