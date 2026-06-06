'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock, User, MapPin, RefreshCw, Activity, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { getIncidents, updateIncidentStatus } from '@/lib/supabase';
import { formatElapsed } from '@/lib/utils';

type Incident = {
  id: string;
  report_type: string;
  status: string;
  priority: string;
  patient_name?: string;
  patient_id: string;
  description?: string;
  latitude: number;
  longitude: number;
  assigned_officer_name?: string;
  created_at: string;
  dispatched_at?: string;
  resolved_at?: string;
};

function statusBadge(status: string) {
  const v: Record<string, 'warning' | 'info' | 'default' | 'success' | 'destructive'> = {
    Pending: 'warning', Dispatched: 'info', EnRoute: 'info',
    Resolved: 'success', Cancelled: 'destructive', OnScene: 'default',
  };
  return v[status] ?? 'default';
}

export default function MedicalDashboard() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dutyStatus, setDutyStatus] = useState<'available' | 'busy' | 'off'>('available');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getIncidents();
    setIncidents((data as Incident[]).filter(i => i.report_type === 'Medical'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function acceptCase(incident: Incident) {
    setUpdating(incident.id);
    const officerName = session?.user?.name ?? 'Medical Officer';
    const { error } = await updateIncidentStatus(incident.id, 'Dispatched', officerName);
    setUpdating(null);
    if (error) { toast.error('Failed to accept case'); return; }
    toast.success('Case accepted — navigate to patient location');
    setDutyStatus('busy');
    await load();
    setSelected(incidents.find(i => i.id === incident.id) ?? null);
  }

  async function markOnScene(id: string) {
    setUpdating(id);
    const { error } = await updateIncidentStatus(id, 'EnRoute');
    setUpdating(null);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Status updated to En Route');
    await load();
  }

  async function resolveCase(id: string) {
    setUpdating(id);
    const { error } = await updateIncidentStatus(id, 'Resolved');
    setUpdating(null);
    if (error) { toast.error('Failed to resolve'); return; }
    toast.success('Case resolved');
    setSelected(null);
    setDutyStatus('available');
    await load();
  }

  const pending = incidents.filter(i => i.status === 'Pending');
  const active = incidents.filter(i => ['Dispatched', 'EnRoute', 'OnScene'].includes(i.status));
  const resolved = incidents.filter(i => i.status === 'Resolved');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Officer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Dr. {session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <select value={dutyStatus} onChange={e => setDutyStatus(e.target.value as typeof dutyStatus)}
              className="text-sm font-medium bg-transparent focus:outline-none pr-1">
              <option value="available">Available</option>
              <option value="busy">On Case</option>
              <option value="off">Off Duty</option>
            </select>
          </div>
          <button onClick={load}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard value={pending.length} label="Pending Calls" color="red" delta={pending.length > 0 ? 'Needs attention' : 'Queue clear'} />
        <StatCard value={active.length} label="Active Cases" color="amber" />
        <StatCard value={resolved.length} label="Resolved Today" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Queue */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Dispatch Queue
                {pending.length > 0 && (
                  <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {pending.length} PENDING
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-300" />
                  <p>No medical incidents at this time</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incidents.map(inc => (
                    <button key={inc.id} onClick={() => setSelected(inc)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm ${
                        selected?.id === inc.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          inc.status === 'Pending' ? 'bg-red-100' : inc.status === 'Resolved' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            inc.status === 'Pending' ? 'text-red-500' : inc.status === 'Resolved' ? 'text-green-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm truncate">
                            {inc.patient_name ?? 'Unknown Patient'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{inc.description ?? 'No description'}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={statusBadge(inc.status)}>{inc.status}</Badge>
                          <span className="text-xs text-slate-400">{formatElapsed(inc.created_at)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Case Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{selected.patient_name ?? 'Unknown'}</div>
                    <Badge variant={statusBadge(selected.status)} className="mt-1">{selected.status}</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{selected.description ?? 'No description provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{formatElapsed(selected.created_at)}</span>
                  </div>
                </div>

                {selected.status === 'Pending' && (
                  <button onClick={() => acceptCase(selected)} disabled={!!updating}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Accepting...' : 'Accept & Respond'}
                  </button>
                )}
                {selected.status === 'Dispatched' && (
                  <button onClick={() => markOnScene(selected.id)} disabled={!!updating}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Updating...' : 'Mark En Route'}
                  </button>
                )}
                {['Dispatched', 'EnRoute', 'OnScene'].includes(selected.status) && (
                  <button onClick={() => resolveCase(selected.id)} disabled={!!updating}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Resolving...' : 'Mark Resolved'}
                  </button>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Quick Actions</p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <PhoneCall className="h-3 w-3" />
                    <span>Notify Command: ext. 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm">Select an incident to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
