
-- Camp Operations Platform Tables

-- Incidents table
CREATE TABLE IF NOT EXISTS camp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('Medical', 'Security', 'Fire', 'Crowd', 'Vehicle', 'Missing', 'Hazard')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispatched', 'EnRoute', 'OnScene', 'Resolved', 'Cancelled')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  reporter_name TEXT,
  reporter_id TEXT,
  patient_name TEXT,
  latitude DECIMAL(10, 8) NOT NULL DEFAULT 6.8111,
  longitude DECIMAL(11, 8) NOT NULL DEFAULT 3.4244,
  location_text TEXT,
  description TEXT,
  assigned_officer_id TEXT,
  assigned_officer_name TEXT,
  resolved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

ALTER TABLE camp_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read incidents" ON camp_incidents FOR SELECT USING (true);
CREATE POLICY "Public insert incidents" ON camp_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update incidents" ON camp_incidents FOR UPDATE USING (true);
CREATE POLICY "Public delete incidents" ON camp_incidents FOR DELETE USING (true);

-- Missing persons table
CREATE TABLE IF NOT EXISTS camp_missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  description TEXT NOT NULL,
  clothing_description TEXT,
  photo_url TEXT,
  last_seen_area TEXT,
  last_seen_time TIMESTAMPTZ,
  reporter_name TEXT,
  reporter_phone TEXT,
  relationship TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Found', 'Closed')),
  assigned_team TEXT,
  sighting_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  found_at TIMESTAMPTZ
);

ALTER TABLE camp_missing_persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read missing" ON camp_missing_persons FOR SELECT USING (true);
CREATE POLICY "Public insert missing" ON camp_missing_persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update missing" ON camp_missing_persons FOR UPDATE USING (true);
CREATE POLICY "Public delete missing" ON camp_missing_persons FOR DELETE USING (true);

-- Sightings table
CREATE TABLE IF NOT EXISTS camp_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES camp_missing_persons(id) ON DELETE CASCADE,
  reporter_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_description TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE camp_sightings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sightings" ON camp_sightings FOR SELECT USING (true);
CREATE POLICY "Public insert sightings" ON camp_sightings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sightings" ON camp_sightings FOR UPDATE USING (true);
CREATE POLICY "Public delete sightings" ON camp_sightings FOR DELETE USING (true);

-- Shuttle vehicles
CREATE TABLE IF NOT EXISTS camp_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name TEXT,
  driver_id TEXT,
  registration TEXT NOT NULL,
  capacity INTEGER DEFAULT 14,
  status TEXT DEFAULT 'Offline' CHECK (status IN ('Available', 'EnRoute', 'Offline', 'Maintenance')),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_zone TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE camp_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicles" ON camp_vehicles FOR SELECT USING (true);
CREATE POLICY "Public insert vehicles" ON camp_vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update vehicles" ON camp_vehicles FOR UPDATE USING (true);
CREATE POLICY "Public delete vehicles" ON camp_vehicles FOR DELETE USING (true);

-- Shuttle requests
CREATE TABLE IF NOT EXISTS camp_shuttle_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_name TEXT,
  passenger_id TEXT,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  pickup_location TEXT,
  destination_location TEXT,
  passenger_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Requested' CHECK (status IN ('Requested', 'Assigned', 'InTransit', 'Completed', 'Cancelled')),
  vehicle_id UUID REFERENCES camp_vehicles(id),
  driver_name TEXT,
  estimated_arrival_mins INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE camp_shuttle_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read shuttles" ON camp_shuttle_requests FOR SELECT USING (true);
CREATE POLICY "Public insert shuttles" ON camp_shuttle_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update shuttles" ON camp_shuttle_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete shuttles" ON camp_shuttle_requests FOR DELETE USING (true);

-- Parking pins
CREATE TABLE IF NOT EXISTS camp_parking_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_name TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  area_label TEXT,
  vehicle_description TEXT,
  licence_plate TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE camp_parking_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read parking" ON camp_parking_pins FOR SELECT USING (true);
CREATE POLICY "Public insert parking" ON camp_parking_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update parking" ON camp_parking_pins FOR UPDATE USING (true);
CREATE POLICY "Public delete parking" ON camp_parking_pins FOR DELETE USING (true);

-- Personnel roster (responders)
CREATE TABLE IF NOT EXISTS camp_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('medical', 'security', 'driver', 'admin')),
  badge_id TEXT,
  status TEXT DEFAULT 'Offline' CHECK (status IN ('Available', 'OnDuty', 'Offline', 'OnScene')),
  zone TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE camp_personnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read personnel" ON camp_personnel FOR SELECT USING (true);
CREATE POLICY "Public insert personnel" ON camp_personnel FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update personnel" ON camp_personnel FOR UPDATE USING (true);
CREATE POLICY "Public delete personnel" ON camp_personnel FOR DELETE USING (true);
