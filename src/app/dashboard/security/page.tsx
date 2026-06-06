'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert as AlertTriangle, Search, CircleCheck as CheckCircle2, Clock, User, MapPin, RefreshCw, Activity, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { getIncidents, getMissingPersons, updateIncidentStatus, updateMissingPersonStatus } from '@/lib/supabase';
import { formatElapsed } from '@/lib/utils';

type Incident = {
  id: string;
  report_type: string;
  status: string;
  priority: string;
  patient_name?: string;
  description?: string;
  latitude: number;
  longitude: number;
  assigned_officer_name?: string;
  created_at: string;
};

type MissingPerson = {
  id: string;
  full_name: string;
  status: string;
  description: string;
  last_seen_area_text?: string;
  sighting_count: number;
  age?: number;
  created_at: string;
};

type Tab = 'dispatch' | 'missing';

function statusBadge(status: string) {
  const v: Record<string, 'warning' | 'info' | 'default' | 'success' | 'destructive'> = {
    Pending: 'warning', Dispatched: 'info', EnRoute: 'info',
    Resolved: 'success', Cancelled: 'destructive',
  };
  return v[status] ?? 'default';
}

export default function SecurityDashboard() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('dispatch');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInc, setSelectedInc] = useState<Incident | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dutyStatus, setDutyStatus] = useState<'available' | 'patrol' | 'off'>('available');

  const load = useCallback(async () => {
    setLoading(true);
    const [incRes, mpRes] = await Promise.all([getIncidents(), getMissingPersons()]);
    setIncidents((incRes.data as Incident[]).filter(i => i.report_type === 'Security' || i.report_type === 'Crowd'));
    setMissingPersons(mpRes.data as MissingPerson[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function respondToIncident(inc: Incident) {
    setUpdating(inc.id);
    const { error } = await updateIncidentStatus(inc.id, 'Dispatched', session?.user?.name ?? 'Security Officer');
    setUpdating(null);
    if (error) { toast.error('Failed to respond'); return; }
    toast.success('Responding to incident');
    setDutyStatus('patrol');
    await load();
  }

  async function resolveIncident(id: string) {
    setUpdating(id);
    const { error } = await updateIncidentStatus(id, 'Resolved');
    setUpdating(null);
    if (error) { toast.error('Failed to resolve'); return; }
    toast.success('Incident resolved');
    setSelectedInc(null);
    setDutyStatus('available');
    await load();
  }

  async function markPersonFound(id: string) {
    setUpdating(id);
    const { error } = await updateMissingPersonStatus(id, 'Found');
    setUpdating(null);
    if (error) { toast.error('Failed to update'); return; }
    toast.success('Person marked as found!');
    setSelectedPerson(null);
    await load();
  }

  const pendingInc = incidents.filter(i => i.status === 'Pending');
  const activeInc = incidents.filter(i => ['Dispatched', 'EnRoute'].includes(i.status));
  const openMissing = missingPersons.filter(p => p.status === 'Open');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Officer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">{session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <select value={dutyStatus} onChange={e => setDutyStatus(e.target.value as typeof dutyStatus)}
              className="text-sm font-medium bg-transparent focus:outline-none pr-1">
              <option value="available">Available</option>
              <option value="patrol">On Patrol</option>
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
        <StatCard value={pendingInc.length} label="Pending Incidents" color="red" delta={pendingInc.length > 0 ? 'Immediate response needed' : 'Clear'} />
        <StatCard value={activeInc.length} label="Active Responses" color="amber" />
        <StatCard value={openMissing.length} label="Missing Persons Open" color="blue" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab('dispatch')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'dispatch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Security Dispatch
          {pendingInc.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">{pendingInc.length}</span>}
        </button>
        <button onClick={() => setTab('missing')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'missing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Missing Persons
          {openMissing.length > 0 && <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">{openMissing.length}</span>}
        </button>
      </div>

      {tab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  Security Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-300" />
                    <p>No security incidents at this time</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incidents.map(inc => (
                      <button key={inc.id} onClick={() => setSelectedInc(inc)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          selectedInc?.id === inc.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'
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
                            <div className="font-medium text-slate-900 text-sm">{inc.report_type} Incident</div>
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
          <div className="lg:col-span-2">
            {selectedInc ? (
              <Card className="sticky top-4">
                <CardHeader className="pb-3"><CardTitle className="text-base">Incident Detail</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{selectedInc.report_type} — <Badge variant={statusBadge(selectedInc.status)}>{selectedInc.status}</Badge></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{selectedInc.patient_name ?? 'Unknown'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{selectedInc.latitude.toFixed(4)}, {selectedInc.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{formatElapsed(selectedInc.created_at)}</span>
                    </div>
                    {selectedInc.description && (
                      <p className="bg-slate-50 rounded-lg p-3 text-slate-600 text-xs">{selectedInc.description}</p>
                    )}
                  </div>
                  {selectedInc.status === 'Pending' && (
                    <button onClick={() => respondToIncident(selectedInc)} disabled={!!updating}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                      {updating === selectedInc.id ? 'Responding...' : 'Respond to Incident'}
                    </button>
                  )}
                  {['Dispatched', 'EnRoute'].includes(selectedInc.status) && (
                    <button onClick={() => resolveIncident(selectedInc.id)} disabled={!!updating}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                      {updating === selectedInc.id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
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
      )}

      {tab === 'missing' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" /> Missing Person Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : missingPersons.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">No alerts on record</p>
                ) : (
                  <div className="space-y-2">
                    {missingPersons.map(p => (
                      <button key={p.id} onClick={() => setSelectedPerson(p)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          selectedPerson?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-sm flex-shrink-0">
                            {p.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm">{p.full_name}</div>
                            <div className="text-xs text-slate-400">{p.last_seen_area_text ?? 'Location unknown'}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={p.status === 'Open' ? 'warning' : p.status === 'Found' ? 'success' : 'secondary'}>
                              {p.status}
                            </Badge>
                            <span className="text-xs text-slate-400">{p.sighting_count} sightings</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {selectedPerson ? (
              <Card className="sticky top-4">
                <CardHeader className="pb-3"><CardTitle className="text-base">Alert Detail</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
                      {selectedPerson.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{selectedPerson.full_name}</div>
                      {selectedPerson.age && <div className="text-sm text-slate-500">Age: {selectedPerson.age}</div>}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{selectedPerson.last_seen_area_text ?? 'Unknown'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Eye className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{selectedPerson.sighting_count} sighting(s) reported</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{formatElapsed(selectedPerson.created_at)}</span>
                    </div>
                    <p className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">{selectedPerson.description}</p>
                  </div>
                  {selectedPerson.status === 'Open' && (
                    <button onClick={() => markPersonFound(selectedPerson.id)} disabled={!!updating}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                      {updating === selectedPerson.id ? 'Updating...' : 'Mark as Found'}
                    </button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Select an alert to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
