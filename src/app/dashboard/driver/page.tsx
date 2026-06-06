'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Bus, MapPin, CircleCheck as CheckCircle2, Clock, User, RefreshCw, ToggleLeft, ToggleRight, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { getShuttleRequests, getVehicles, updateShuttleRequestStatus, updateVehicleStatus } from '@/lib/supabase';
import { formatElapsed } from '@/lib/utils';

type ShuttleRequest = {
  id: string;
  passenger_id: string;
  passenger_name?: string;
  status: string;
  pickup_location_text?: string;
  destination_text?: string;
  passenger_count?: number;
  vehicle_id?: string;
  driver_name?: string;
  created_at: string;
  completed_at?: string;
};

type Vehicle = {
  id: string;
  driver_id?: string;
  driver_name?: string;
  registration: string;
  capacity: number;
  status: string;
  latitude?: number;
  longitude?: number;
};

function requestStatusBadge(status: string) {
  const v: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    Pending: 'warning', Assigned: 'info', InProgress: 'info',
    Completed: 'success', Cancelled: 'destructive',
  };
  return v[status] ?? 'secondary';
}

export default function DriverDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ShuttleRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [selected, setSelected] = useState<ShuttleRequest | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [myVehicle, setMyVehicle] = useState<Vehicle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [reqRes, vehRes] = await Promise.all([getShuttleRequests(), getVehicles()]);
    setRequests(reqRes.data as ShuttleRequest[]);
    const vehs = vehRes.data as Vehicle[];
    setVehicles(vehs);
    const driverVehicle = vehs.find(v => v.driver_name === session?.user?.name || v.driver_id === session?.user?.id);
    if (driverVehicle) setMyVehicle(driverVehicle);
    else if (vehs.length > 0) setMyVehicle(vehs[0]);
    setLoading(false);
  }, [session?.user?.id, session?.user?.name]);

  useEffect(() => { load(); }, [load]);

  async function toggleAvailability() {
    const next = !available;
    setAvailable(next);
    if (myVehicle) {
      await updateVehicleStatus(myVehicle.id, next ? 'Available' : 'Off Duty');
      toast.success(next ? 'You are now available for pickups' : 'You are now off duty');
    }
  }

  async function acceptRequest(req: ShuttleRequest) {
    setUpdating(req.id);
    const { error } = await updateShuttleRequestStatus(req.id, 'Assigned', myVehicle?.id, session?.user?.name ?? 'Driver');
    setUpdating(null);
    if (error) { toast.error('Failed to accept request'); return; }
    toast.success('Request accepted! Navigate to pickup location.');
    await load();
  }

  async function startTrip(id: string) {
    setUpdating(id);
    const { error } = await updateShuttleRequestStatus(id, 'InProgress');
    setUpdating(null);
    if (error) { toast.error('Failed to update'); return; }
    toast.success('Trip started');
    await load();
  }

  async function completeTrip(id: string) {
    setUpdating(id);
    const { error } = await updateShuttleRequestStatus(id, 'Completed');
    setUpdating(null);
    if (error) { toast.error('Failed to complete trip'); return; }
    toast.success('Trip completed!');
    setSelected(null);
    await load();
  }

  const pending = requests.filter(r => r.status === 'Pending');
  const myActive = requests.filter(r => ['Assigned', 'InProgress'].includes(r.status) && r.driver_name === session?.user?.name);
  const completed = requests.filter(r => r.status === 'Completed');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">{session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${
              available ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'
            }`}>
            {available ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {available ? 'Available' : 'Off Duty'}
          </button>
          <button onClick={load}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {myVehicle && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Bus className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">{myVehicle.registration}</div>
            <div className="text-sm text-slate-500">Capacity: {myVehicle.capacity} passengers</div>
          </div>
          <Badge variant={myVehicle.status === 'Available' ? 'success' : myVehicle.status === 'On Trip' ? 'info' : 'secondary'}>
            {myVehicle.status}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard value={pending.length} label="Pending Requests" color="amber" delta={pending.length > 0 ? 'Waiting for pickup' : 'No requests'} />
        <StatCard value={myActive.length} label="My Active Trips" color="blue" />
        <StatCard value={completed.length} label="Completed Today" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-emerald-600" />
                Pickup Requests
                {pending.length > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pending.length} waiting
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-300" />
                  <p>No shuttle requests at this time</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map(req => (
                    <button key={req.id} onClick={() => setSelected(req)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selected?.id === req.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm">{req.passenger_name ?? 'Passenger'}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {req.pickup_location_text ?? '—'} → {req.destination_text ?? '—'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={requestStatusBadge(req.status)}>{req.status}</Badge>
                          <span className="text-xs text-slate-400">{formatElapsed(req.created_at)}</span>
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
          {selected ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Trip Detail</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{selected.passenger_name ?? 'Passenger'}</span>
                    {selected.passenger_count && (
                      <span className="text-slate-400">× {selected.passenger_count}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Pickup</div>
                        <div className="text-slate-700">{selected.pickup_location_text ?? 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="w-px h-4 bg-slate-200 ml-1" />
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Destination</div>
                        <div className="text-slate-700">{selected.destination_text ?? 'Unknown'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">{formatElapsed(selected.created_at)}</span>
                  </div>
                </div>

                {selected.status === 'Pending' && available && (
                  <button onClick={() => acceptRequest(selected)} disabled={!!updating}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Accepting...' : 'Accept Pickup'}
                  </button>
                )}
                {selected.status === 'Assigned' && (
                  <button onClick={() => startTrip(selected.id)} disabled={!!updating}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Starting...' : 'Passenger On Board — Start Trip'}
                  </button>
                )}
                {selected.status === 'InProgress' && (
                  <button onClick={() => completeTrip(selected.id)} disabled={!!updating}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                    {updating === selected.id ? 'Completing...' : 'Complete Trip'}
                  </button>
                )}

                <a href={`https://www.google.com/maps/dir/?api=1&destination=${6.8403},${3.3864}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Open Navigation
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bus className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm">Select a request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
