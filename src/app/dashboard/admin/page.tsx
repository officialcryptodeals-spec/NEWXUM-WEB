'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert as AlertTriangle, Search, Bus, Users, RefreshCw, CircleCheck as CheckCircle2, Clock, MapPin, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { getIncidents, getMissingPersons, getShuttleRequests, getPersonnel, updateIncidentStatus } from '@/lib/supabase';
import { formatElapsed } from '@/lib/utils';

type Incident = {
  id: string;
  report_type: string;
  status: string;
  priority: string;
  patient_name?: string;
  description?: string;
  assigned_officer_name?: string;
  created_at: string;
};

type MissingPerson = {
  id: string;
  full_name: string;
  status: string;
  last_seen_area_text?: string;
  sighting_count: number;
  created_at: string;
};

type ShuttleRequest = {
  id: string;
  passenger_name?: string;
  status: string;
  pickup_location_text?: string;
  destination_text?: string;
  created_at: string;
};

type Personnel = {
  id: string;
  name: string;
  role: string;
  badge_id?: string;
  status: string;
  zone?: string;
};

type Tab = 'overview' | 'incidents' | 'missing' | 'transit' | 'personnel';

function statusBadge(status: string) {
  const v: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    Pending: 'warning', Dispatched: 'info', EnRoute: 'info',
    Resolved: 'success', Cancelled: 'destructive',
  };
  return v[status] ?? 'secondary';
}

export default function AdminCommandCenter() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [shuttleRequests, setShuttleRequests] = useState<ShuttleRequest[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [incRes, mpRes, srRes, perRes] = await Promise.all([
      getIncidents(), getMissingPersons(), getShuttleRequests(), getPersonnel(),
    ]);
    setIncidents(incRes.data as Incident[]);
    setMissingPersons(mpRes.data as MissingPerson[]);
    setShuttleRequests(srRes.data as ShuttleRequest[]);
    setPersonnel(perRes.data as Personnel[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function forceResolve(id: string) {
    setUpdating(id);
    const { error } = await updateIncidentStatus(id, 'Resolved', 'Admin Override');
    setUpdating(null);
    if (error) { toast.error('Failed to resolve'); return; }
    toast.success('Incident resolved by admin');
    await load();
  }

  const pendingInc = incidents.filter(i => i.status === 'Pending');
  const activeInc = incidents.filter(i => ['Dispatched', 'EnRoute', 'OnScene'].includes(i.status));
  const resolvedToday = incidents.filter(i => i.status === 'Resolved');
  const openMissing = missingPersons.filter(p => p.status === 'Open');
  const pendingShuttle = shuttleRequests.filter(r => r.status === 'Pending');
  const onDuty = personnel.filter(p => p.status === 'On Duty' || p.status === 'Available');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'incidents', label: 'Incidents', count: pendingInc.length },
    { id: 'missing', label: 'Missing Persons', count: openMissing.length },
    { id: 'transit', label: 'Transit', count: pendingShuttle.length },
    { id: 'personnel', label: 'Personnel' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">HQ — {session?.user?.name}</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-600">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
            {(t.count ?? 0) > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard value={pendingInc.length} label="Pending Incidents" color="red" delta={pendingInc.length > 0 ? 'Needs dispatch' : 'All clear'} />
            <StatCard value={openMissing.length} label="Open Missing Alerts" color="blue" />
            <StatCard value={resolvedToday.length} label="Resolved Today" color="green" />
            <StatCard value={onDuty.length} label="Personnel On Duty" color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Recent Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center py-6"><Spinner /></div> : (
                  <div className="space-y-2">
                    {incidents.slice(0, 5).map(inc => (
                      <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          inc.status === 'Pending' ? 'bg-red-500 animate-pulse' :
                          inc.status === 'Resolved' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {inc.report_type} — {inc.patient_name ?? 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400">{formatElapsed(inc.created_at)}</div>
                        </div>
                        <Badge variant={statusBadge(inc.status)} className="text-xs">{inc.status}</Badge>
                      </div>
                    ))}
                    {incidents.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No incidents</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-4 w-4 text-blue-500" /> Missing Persons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center py-6"><Spinner /></div> : (
                  <div className="space-y-2">
                    {missingPersons.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {p.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{p.full_name}</div>
                          <div className="text-xs text-slate-400">{p.last_seen_area_text ?? 'Unknown location'} · {p.sighting_count} sightings</div>
                        </div>
                        <Badge variant={p.status === 'Open' ? 'warning' : p.status === 'Found' ? 'success' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                    {missingPersons.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No alerts</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bus className="h-4 w-4 text-emerald-500" /> Transit Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center py-6"><Spinner /></div> : (
                  <div className="space-y-2">
                    {shuttleRequests.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Bus className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{r.passenger_name ?? 'Passenger'}</div>
                          <div className="text-xs text-slate-400 truncate">{r.pickup_location_text} → {r.destination_text}</div>
                        </div>
                        <Badge variant={
                          r.status === 'Pending' ? 'warning' : r.status === 'Completed' ? 'success' : 'info'
                        }>{r.status}</Badge>
                      </div>
                    ))}
                    {shuttleRequests.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No requests</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-amber-500" /> Personnel Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center py-6"><Spinner /></div> : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Medical', count: personnel.filter(p => p.role === 'medical_officer').length, color: 'bg-red-100 text-red-700' },
                        { label: 'Security', count: personnel.filter(p => p.role === 'security_officer').length, color: 'bg-blue-100 text-blue-700' },
                        { label: 'Drivers', count: personnel.filter(p => p.role === 'driver').length, color: 'bg-emerald-100 text-emerald-700' },
                      ].map(s => (
                        <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                          <div className="text-2xl font-bold">{s.count}</div>
                          <div className="text-xs mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {personnel.slice(0, 4).map(p => (
                        <div key={p.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'On Duty' || p.status === 'Available' ? 'bg-green-500' : 'bg-slate-300'}`} />
                          <span className="font-medium text-slate-800 truncate flex-1">{p.name}</span>
                          <span className="text-slate-400 text-xs">{p.zone}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {tab === 'incidents' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> All Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Type</th>
                      <th className="pb-3 font-semibold text-slate-600">Patient</th>
                      <th className="pb-3 font-semibold text-slate-600">Status</th>
                      <th className="pb-3 font-semibold text-slate-600">Officer</th>
                      <th className="pb-3 font-semibold text-slate-600">Time</th>
                      <th className="pb-3 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incidents.map(inc => (
                      <tr key={inc.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            inc.report_type === 'Medical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {inc.report_type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-800 font-medium">{inc.patient_name ?? 'Unknown'}</td>
                        <td className="py-3 pr-4"><Badge variant={statusBadge(inc.status)}>{inc.status}</Badge></td>
                        <td className="py-3 pr-4 text-slate-500">{inc.assigned_officer_name ?? '—'}</td>
                        <td className="py-3 pr-4 text-slate-400">{formatElapsed(inc.created_at)}</td>
                        <td className="py-3">
                          {inc.status !== 'Resolved' && inc.status !== 'Cancelled' && (
                            <button onClick={() => forceResolve(inc.id)} disabled={!!updating}
                              className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg transition-colors">
                              {updating === inc.id ? '...' : 'Resolve'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {incidents.length === 0 && <p className="text-center text-slate-400 py-8">No incidents</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'missing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Missing Person Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Name</th>
                      <th className="pb-3 font-semibold text-slate-600">Last Seen</th>
                      <th className="pb-3 font-semibold text-slate-600">Status</th>
                      <th className="pb-3 font-semibold text-slate-600">Sightings</th>
                      <th className="pb-3 font-semibold text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {missingPersons.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-900">{p.full_name}</td>
                        <td className="py-3 pr-4 text-slate-500">{p.last_seen_area_text ?? '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={p.status === 'Open' ? 'warning' : p.status === 'Found' ? 'success' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{p.sighting_count}</td>
                        <td className="py-3 text-slate-400">{formatElapsed(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {missingPersons.length === 0 && <p className="text-center text-slate-400 py-8">No alerts</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'transit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-emerald-500" /> Shuttle Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Passenger</th>
                      <th className="pb-3 font-semibold text-slate-600">Pickup</th>
                      <th className="pb-3 font-semibold text-slate-600">Destination</th>
                      <th className="pb-3 font-semibold text-slate-600">Status</th>
                      <th className="pb-3 font-semibold text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shuttleRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-900">{r.passenger_name ?? 'Unknown'}</td>
                        <td className="py-3 pr-4 text-slate-500">{r.pickup_location_text ?? '—'}</td>
                        <td className="py-3 pr-4 text-slate-500">{r.destination_text ?? '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={r.status === 'Pending' ? 'warning' : r.status === 'Completed' ? 'success' : 'info'}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-slate-400">{formatElapsed(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {shuttleRequests.length === 0 && <p className="text-center text-slate-400 py-8">No requests</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'personnel' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" /> Camp Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="pb-3 font-semibold text-slate-600">Name</th>
                      <th className="pb-3 font-semibold text-slate-600">Role</th>
                      <th className="pb-3 font-semibold text-slate-600">Badge</th>
                      <th className="pb-3 font-semibold text-slate-600">Zone</th>
                      <th className="pb-3 font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personnel.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-900">{p.name}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            p.role === 'medical_officer' ? 'bg-red-100 text-red-700' :
                            p.role === 'security_officer' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.role === 'medical_officer' ? 'Medical' : p.role === 'security_officer' ? 'Security' : 'Driver'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{p.badge_id ?? '—'}</td>
                        <td className="py-3 pr-4 text-slate-500">{p.zone ?? '—'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'On Duty' || p.status === 'Available' ? 'bg-green-500' :
                              p.status === 'On Scene' ? 'bg-amber-500' : 'bg-slate-300'
                            }`} />
                            <span className="text-slate-600">{p.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {personnel.length === 0 && <p className="text-center text-slate-400 py-8">No personnel records</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
