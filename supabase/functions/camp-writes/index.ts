import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getSupabaseAdmin(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

type WriteAction = {
  table: string;
  operation: "insert" | "update" | "delete";
  data?: Record<string, unknown>;
  id?: string;
};

const ALLOWED_TABLES = new Set([
  "camp_incidents",
  "camp_missing_persons",
  "camp_parking_pins",
  "camp_personnel",
  "camp_shuttle_requests",
  "camp_sightings",
  "camp_vehicles",
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: WriteAction = await req.json();
    const { table, operation, data, id } = body;

    if (!table || !ALLOWED_TABLES.has(table)) {
      return new Response(JSON.stringify({ error: "Invalid table" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!operation || !["insert", "update", "delete"].includes(operation)) {
      return new Response(JSON.stringify({ error: "Invalid operation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseAdmin(req);
    let result;

    switch (operation) {
      case "insert": {
        if (!data) {
          return new Response(JSON.stringify({ error: "Data required for insert" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await supabase.from(table).insert(data).select().single();
        break;
      }
      case "update": {
        if (!id || !data) {
          return new Response(JSON.stringify({ error: "Id and data required for update" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await supabase.from(table).update(data).eq("id", id).select().single();
        break;
      }
      case "delete": {
        if (!id) {
          return new Response(JSON.stringify({ error: "Id required for delete" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await supabase.from(table).delete().eq("id", id).select().single();
        break;
      }
    }

    if (result!.error) {
      return new Response(JSON.stringify({ error: result!.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: result!.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
