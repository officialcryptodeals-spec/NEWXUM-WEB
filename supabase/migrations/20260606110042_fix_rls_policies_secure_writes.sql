-- ═══════════════════════════════════════════════════════════════
-- Fix insecure RLS policies: remove USING(true) / WITH CHECK(true)
-- Strategy:
--   SELECT remains public (app needs to read without Supabase Auth)
--   INSERT/UPDATE/DELETE restricted to authenticated role only
--   Write operations will be proxied through an Edge Function
--   that uses the service role key (bypasses RLS server-side)
-- ═══════════════════════════════════════════════════════════════

-- ── camp_incidents ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete incidents" ON camp_incidents;
DROP POLICY IF EXISTS "Public insert incidents" ON camp_incidents;
DROP POLICY IF EXISTS "Public update incidents" ON camp_incidents;

CREATE POLICY "Authenticated insert incidents" ON camp_incidents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update incidents" ON camp_incidents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete incidents" ON camp_incidents
  FOR DELETE TO authenticated USING (true);

-- ── camp_missing_persons ────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete missing" ON camp_missing_persons;
DROP POLICY IF EXISTS "Public insert missing" ON camp_missing_persons;
DROP POLICY IF EXISTS "Public update missing" ON camp_missing_persons;

CREATE POLICY "Authenticated insert missing" ON camp_missing_persons
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update missing" ON camp_missing_persons
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete missing" ON camp_missing_persons
  FOR DELETE TO authenticated USING (true);

-- ── camp_parking_pins ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete parking" ON camp_parking_pins;
DROP POLICY IF EXISTS "Public insert parking" ON camp_parking_pins;
DROP POLICY IF EXISTS "Public update parking" ON camp_parking_pins;

CREATE POLICY "Authenticated insert parking" ON camp_parking_pins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update parking" ON camp_parking_pins
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete parking" ON camp_parking_pins
  FOR DELETE TO authenticated USING (true);

-- ── camp_personnel ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete personnel" ON camp_personnel;
DROP POLICY IF EXISTS "Public insert personnel" ON camp_personnel;
DROP POLICY IF EXISTS "Public update personnel" ON camp_personnel;

CREATE POLICY "Authenticated insert personnel" ON camp_personnel
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update personnel" ON camp_personnel
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete personnel" ON camp_personnel
  FOR DELETE TO authenticated USING (true);

-- ── camp_shuttle_requests ──────────────────────────────────────
DROP POLICY IF EXISTS "Public delete shuttles" ON camp_shuttle_requests;
DROP POLICY IF EXISTS "Public insert shuttles" ON camp_shuttle_requests;
DROP POLICY IF EXISTS "Public update shuttles" ON camp_shuttle_requests;

CREATE POLICY "Authenticated insert shuttles" ON camp_shuttle_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update shuttles" ON camp_shuttle_requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete shuttles" ON camp_shuttle_requests
  FOR DELETE TO authenticated USING (true);

-- ── camp_sightings ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete sightings" ON camp_sightings;
DROP POLICY IF EXISTS "Public insert sightings" ON camp_sightings;
DROP POLICY IF EXISTS "Public update sightings" ON camp_sightings;

CREATE POLICY "Authenticated insert sightings" ON camp_sightings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update sightings" ON camp_sightings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete sightings" ON camp_sightings
  FOR DELETE TO authenticated USING (true);

-- ── camp_vehicles ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public delete vehicles" ON camp_vehicles;
DROP POLICY IF EXISTS "Public insert vehicles" ON camp_vehicles;
DROP POLICY IF EXISTS "Public update vehicles" ON camp_vehicles;

CREATE POLICY "Authenticated insert vehicles" ON camp_vehicles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update vehicles" ON camp_vehicles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete vehicles" ON camp_vehicles
  FOR DELETE TO authenticated USING (true);
