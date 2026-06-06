import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Camp data helpers
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

export async function updateIncidentStatus(id: string, status: string, officerName?: string) {
  const update: Record<string, unknown> = { status };
  if (officerName) update.assigned_officer_name = officerName;
  if (status === 'Resolved') update.resolved_at = new Date().toISOString();
  if (status === 'Dispatched') update.dispatched_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('camp_incidents')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function updateMissingPersonStatus(id: string, status: string) {
  const update: Record<string, unknown> = { status };
  if (status === 'Found') update.found_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('camp_missing_persons')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function createIncident(incident: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('camp_incidents')
    .insert(incident)
    .select()
    .single();
  return { data, error };
}

export async function createMissingPersonAlert(alert: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('camp_missing_persons')
    .insert(alert)
    .select()
    .single();
  return { data, error };
}

export async function createParkingPin(pin: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('camp_parking_pins')
    .insert(pin)
    .select()
    .single();
  return { data, error };
}

export async function createShuttleRequest(req: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('camp_shuttle_requests')
    .insert(req)
    .select()
    .single();
  return { data, error };
}

export async function updateVehicleStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('camp_vehicles')
    .update({ status, last_seen_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function updateShuttleRequestStatus(id: string, status: string, vehicleId?: string, driverName?: string) {
  const update: Record<string, unknown> = { status };
  if (vehicleId) update.vehicle_id = vehicleId;
  if (driverName) update.driver_name = driverName;
  if (status === 'Completed') update.completed_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('camp_shuttle_requests')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}
