import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Edge function URL for write operations (bypasses RLS via service role key)
const edgeFnUrl = `${supabaseUrl}/functions/v1/camp-writes`;

async function writeOp(table: string, operation: 'insert' | 'update' | 'delete', data?: Record<string, unknown>, id?: string) {
  const res = await fetch(edgeFnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, operation, data, id }),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: { message: json.error ?? 'Write failed' } };
  return { data: json.data, error: null };
}

// ── Read helpers (anon key, public SELECT policies) ────────────

export async function getIncidents() {
  const { data, error } = await supabase
    .from('camp_incidents')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getMissingPersons() {
  const { data, error } = await supabase
    .from('camp_missing_persons')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getSightings(alertId: string) {
  const { data, error } = await supabase
    .from('camp_sightings')
    .select('*')
    .eq('alert_id', alertId)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getVehicles() {
  const { data, error } = await supabase
    .from('camp_vehicles')
    .select('*')
    .order('status', { ascending: true });
  return { data: data ?? [], error };
}

export async function getShuttleRequests() {
  const { data, error } = await supabase
    .from('camp_shuttle_requests')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getParkingPins() {
  const { data, error } = await supabase
    .from('camp_parking_pins')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getPersonnel() {
  const { data, error } = await supabase
    .from('camp_personnel')
    .select('*')
    .order('role', { ascending: true });
  return { data: data ?? [], error };
}

// ── Write helpers (via edge function, service role key) ─────────

export async function updateIncidentStatus(id: string, status: string, officerName?: string) {
  const data: Record<string, unknown> = { status };
  if (officerName) data.assigned_officer_name = officerName;
  if (status === 'Resolved') data.resolved_at = new Date().toISOString();
  if (status === 'Dispatched') data.dispatched_at = new Date().toISOString();
  return writeOp('camp_incidents', 'update', data, id);
}

export async function updateMissingPersonStatus(id: string, status: string) {
  const data: Record<string, unknown> = { status };
  if (status === 'Found') data.found_at = new Date().toISOString();
  return writeOp('camp_missing_persons', 'update', data, id);
}

export async function createIncident(incident: Record<string, unknown>) {
  return writeOp('camp_incidents', 'insert', incident);
}

export async function createMissingPersonAlert(alert: Record<string, unknown>) {
  return writeOp('camp_missing_persons', 'insert', alert);
}

export async function createParkingPin(pin: Record<string, unknown>) {
  return writeOp('camp_parking_pins', 'insert', pin);
}

export async function createShuttleRequest(req: Record<string, unknown>) {
  return writeOp('camp_shuttle_requests', 'insert', req);
}

export async function updateVehicleStatus(id: string, status: string) {
  return writeOp('camp_vehicles', 'update', { status, last_seen_at: new Date().toISOString() }, id);
}

export async function updateShuttleRequestStatus(id: string, status: string, vehicleId?: string, driverName?: string) {
  const data: Record<string, unknown> = { status };
  if (vehicleId) data.vehicle_id = vehicleId;
  if (driverName) data.driver_name = driverName;
  if (status === 'Completed') data.completed_at = new Date().toISOString();
  return writeOp('camp_shuttle_requests', 'update', data, id);
}
