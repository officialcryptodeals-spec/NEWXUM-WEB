'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert as AlertTriangle, MapPin, Bus, Search, Building2, CircleCheck as CheckCircle2, Clock, Circle as XCircle, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, Badge, Card, CardHeader, CardTitle, CardContent, Spinner, Button } from '@/components/ui';
import { createIncident, createMissingPersonAlert, createParkingPin, createShuttleRequest, getMissingPersons } from '@/lib/supabase';
import { formatElapsed } from '@/lib/utils';

type MissingPerson = {
  id: string;
  full_name: string;
  status: string;
  description: string;
  last_seen_area_text?: string;
  sighting_count: number;
  created_at: string;
  photo_url?: string;
};

type ActiveSection = 'sos' | 'missing' | 'parking' | 'shuttle' | 'accommodation' | null;

export default function WorshipperDashboard() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // SOS form
  const [sosType, setSosType] = useState<'Medical' | 'Security'>('Medical');
  const [sosDesc, setSosDesc] = useState('');

  // Missing person form
  const [mpName, setMpName] = useState('');
  const [mpAge, setMpAge] = useState('');
  const [mpDesc, setMpDesc] = useState('');
  const [mpArea, setMpArea] = useState('');

  // Parking form
  const [parkingArea, setParkingArea] = useState('');
  const [parkingVehicle, setParkingVehicle] = useState('');
  const [parkingPlate, setParkingPlate] = useState('');

  // Shuttle form
  const [shuttlePickup, setShuttlePickup] = useState('');
  const [shuttleDest, setShuttleDest] = useState('');
  const [shuttlePassengers, setShuttlePassengers] = useState('1');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ActiveSection;
    if (hash) setActiveSection(hash);
  }, []);

  useEffect(() => {
    if (activeSection === 'missing') {
      setLoadingAlerts(true);
      getMissingPersons().then(({ data }) => {
        setMissingPersons((data as MissingPerson[]).filter(p => p.status === 'Open'));
        setLoadingAlerts(false);
      });
    }
  }, [activeSection]);

  async function submitSOS(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await createIncident({
      report_type: sosType,
      status: 'Pending',
      priority: 'High',
      patient_id: session?.user?.id ?? 'unknown',
      patient_name: session?.user?.name ?? 'Unknown',
      latitude: 6.8403,
      longitude: 3.3864,
      description: sosDesc,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to submit report'); return; }
    toast.success('Emergency reported! Help is on the way.');
    setSosDesc('');
    setActiveSection(null);
  }

  async function submitMissingPerson(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await createMissingPersonAlert({
      full_name: mpName,
      age: mpAge ? parseInt(mpAge) : null,
      description: mpDesc,
      last_seen_area_text: mpArea,
      status: 'Open',
      reported_by: session?.user?.name ?? 'Unknown',
      sighting_count: 0,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to submit alert'); return; }
    toast.success('Missing person alert sent to all officers!');
    setMpName(''); setMpAge(''); setMpDesc(''); setMpArea('');
    setActiveSection(null);
  }

  async function submitParking(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await createParkingPin({
      user_id: session?.user?.id ?? 'unknown',
      latitude: 6.8403 + (Math.random() - 0.5) * 0.01,
      longitude: 3.3864 + (Math.random() - 0.5) * 0.01,
      area_label: parkingArea,
      vehicle_description: parkingVehicle,
      licence_plate: parkingPlate,
      is_active: true,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to save parking pin'); return; }
    toast.success('Parking pin saved! You can find your vehicle easily.');
    setParkingArea(''); setParkingVehicle(''); setParkingPlate('');
    setActiveSection(null);
  }

  async function submitShuttle(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await createShuttleRequest({
      passenger_id: session?.user?.id ?? 'unknown',
      passenger_name: session?.user?.name ?? 'Unknown',
      pickup_location_text: shuttlePickup,
      destination_text: shuttleDest,
      passenger_count: parseInt(shuttlePassengers),
      status: 'Pending',
      pickup_latitude: 6.8403,
      pickup_longitude: 3.3864,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to submit request'); return; }
    toast.success('Shuttle request submitted! A driver will be assigned shortly.');
    setShuttlePickup(''); setShuttleDest(''); setShuttlePassengers('1');
    setActiveSection(null);
  }

  const sections = [
    { id: 'sos' as const, label: 'Emergency SOS', icon: AlertTriangle, color: 'bg-red-600 hover:bg-red-700', textColor: 'text-white', desc: 'Report medical or security emergencies instantly' },
    { id: 'missing' as const, label: 'Missing Persons', icon: Search, color: 'bg-blue-600 hover:bg-blue-700', textColor: 'text-white', desc: 'View alerts or report a missing person' },
    { id: 'parking' as const, label: 'Parking Pin', icon: MapPin, color: 'bg-emerald-600 hover:bg-emerald-700', textColor: 'text-white', desc: 'Save your vehicle location for easy retrieval' },
    { id: 'shuttle' as const, label: 'Request Shuttle', icon: Bus, color: 'bg-amber-600 hover:bg-amber-700', textColor: 'text-white', desc: 'Book a camp shuttle to your destination' },
    { id: 'accommodation' as const, label: 'Accommodation', icon: Building2, color: 'bg-slate-600 hover:bg-slate-700', textColor: 'text-white', desc: 'Browse and book accommodation on camp' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {session?.user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">RCCG Camp Operations — Worshipper Portal</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard value="24/7" label="Emergency Response" color="red" />
        <StatCard value="Active" label="Camp Operations" color="green" />
        <StatCard value="5M+" label="Peak Worshippers" color="blue" />
        <StatCard value="2,500ha" label="Camp Area" color="amber" />
      </div>

      {activeSection === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`${s.color} ${s.textColor} rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.99] shadow-sm`}>
                <Icon className="h-6 w-6 mb-3 opacity-90" />
                <div className="font-semibold text-lg">{s.label}</div>
                <div className="text-sm opacity-80 mt-0.5">{s.desc}</div>
              </button>
            );
          })}
        </div>
      )}

      {activeSection !== null && (
        <div className="mb-4">
          <button onClick={() => setActiveSection(null)}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            ← Back to overview
          </button>
        </div>
      )}

      {activeSection === 'sos' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" /> Emergency Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitSOS} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Emergency Type</label>
                <div className="flex gap-3">
                  {(['Medical', 'Security'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setSosType(t)}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                        sosType === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Describe the emergency</label>
                <textarea value={sosDesc} onChange={e => setSosDesc(e.target.value)} required rows={3}
                  placeholder="What is happening? Provide as much detail as possible..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <PhoneCall className="h-4 w-4 inline mr-1.5" />
                For life-threatening emergencies, also call <strong>0800-NEXUM-911</strong>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                {submitting ? <Spinner className="mx-auto h-4 w-4 border-white border-t-red-400" /> : 'Send Emergency Alert'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeSection === 'missing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Report Missing Person
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitMissingPerson} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Full Name *</label>
                    <input value={mpName} onChange={e => setMpName(e.target.value)} required
                      placeholder="Person's full name"
                      className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Age</label>
                    <input value={mpAge} onChange={e => setMpAge(e.target.value)} type="number"
                      placeholder="Age (optional)"
                      className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Last seen area *</label>
                  <input value={mpArea} onChange={e => setMpArea(e.target.value)} required
                    placeholder="e.g. Gate 3, near the prayer auditorium"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Description *</label>
                  <textarea value={mpDesc} onChange={e => setMpDesc(e.target.value)} required rows={2}
                    placeholder="Clothing, physical features, any identifying marks..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                  {submitting ? 'Sending alert...' : 'Broadcast Alert to All Officers'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Missing Person Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : missingPersons.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No active alerts at this time</p>
              ) : (
                <div className="space-y-3">
                  {missingPersons.map(person => (
                    <div key={person.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-semibold text-sm">
                        {person.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 text-sm">{person.full_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{person.last_seen_area_text}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatElapsed(person.created_at)}</div>
                      </div>
                      <Badge variant="warning">{person.sighting_count} sightings</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'parking' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" /> Save Parking Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitParking} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Parking Area / Zone *</label>
                <input value={parkingArea} onChange={e => setParkingArea(e.target.value)} required
                  placeholder="e.g. Zone A, Row 3 near Gate 5"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Vehicle Description</label>
                  <input value={parkingVehicle} onChange={e => setParkingVehicle(e.target.value)}
                    placeholder="e.g. Blue Toyota Corolla"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Plate Number</label>
                  <input value={parkingPlate} onChange={e => setParkingPlate(e.target.value)}
                    placeholder="e.g. ABC-123-XY"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {submitting ? 'Saving...' : 'Save Parking Pin'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeSection === 'shuttle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-amber-600" /> Request Shuttle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitShuttle} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Pickup Location *</label>
                <input value={shuttlePickup} onChange={e => setShuttlePickup(e.target.value)} required
                  placeholder="e.g. Gate 2 entrance"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Destination *</label>
                <input value={shuttleDest} onChange={e => setShuttleDest(e.target.value)} required
                  placeholder="e.g. Main Auditorium"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Number of Passengers</label>
                <select value={shuttlePassengers} onChange={e => setShuttlePassengers(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {submitting ? 'Submitting...' : 'Request Shuttle'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeSection === 'accommodation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" /> Accommodation Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Browse Properties</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Find and book accommodation for your stay at Redemption City</p>
              <a href="/worshipper/bookings"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
                Go to Bookings
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
