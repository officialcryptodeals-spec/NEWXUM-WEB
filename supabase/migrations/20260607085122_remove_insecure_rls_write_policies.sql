-- ═══════════════════════════════════════════════════════════════
-- Remove all RLS write policies with USING(true)/WITH CHECK(true)
-- This app does NOT use Supabase Auth — all writes go through the
-- camp-writes Edge Function using the service role key, which
-- bypasses RLS. No Supabase-authenticated users exist, so these
-- policies serve no purpose and are flagged as security issues.
-- ═══════════════════════════════════════════════════════════════

-- camp_incidents
DROP POLICY IF EXISTS "Authenticated delete incidents" ON camp_incidents;
DROP POLICY IF EXISTS "Authenticated insert incidents" ON camp_incidents;
DROP POLICY IF EXISTS "Authenticated update incidents" ON camp_incidents;

-- camp_missing_persons
DROP POLICY IF EXISTS "Authenticated delete missing" ON camp_missing_persons;
DROP POLICY IF EXISTS "Authenticated insert missing" ON camp_missing_persons;
DROP POLICY IF EXISTS "Authenticated update missing" ON camp_missing_persons;

-- camp_parking_pins
DROP POLICY IF EXISTS "Authenticated delete parking" ON camp_parking_pins;
DROP POLICY IF EXISTS "Authenticated insert parking" ON camp_parking_pins;
DROP POLICY IF EXISTS "Authenticated update parking" ON camp_parking_pins;

-- camp_personnel
DROP POLICY IF EXISTS "Authenticated delete personnel" ON camp_personnel;
DROP POLICY IF EXISTS "Authenticated insert personnel" ON camp_personnel;
DROP POLICY IF EXISTS "Authenticated update personnel" ON camp_personnel;

-- camp_shuttle_requests
DROP POLICY IF EXISTS "Authenticated delete shuttles" ON camp_shuttle_requests;
DROP POLICY IF EXISTS "Authenticated insert shuttles" ON camp_shuttle_requests;
DROP POLICY IF EXISTS "Authenticated update shuttles" ON camp_shuttle_requests;

-- camp_sightings
DROP POLICY IF EXISTS "Authenticated delete sightings" ON camp_sightings;
DROP POLICY IF EXISTS "Authenticated insert sightings" ON camp_sightings;
DROP POLICY IF EXISTS "Authenticated update sightings" ON camp_sightings;

-- camp_vehicles
DROP POLICY IF EXISTS "Authenticated delete vehicles" ON camp_vehicles;
DROP POLICY IF EXISTS "Authenticated insert vehicles" ON camp_vehicles;
DROP POLICY IF EXISTS "Authenticated update vehicles" ON camp_vehicles;
