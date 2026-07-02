import { createClient } from "@supabase/supabase-js";
import { Appointment } from "../types";

// User-provided credentials
const SUPABASE_PROJECT_ID = "gmvcvvassdlqlnakihjm";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = "sb_publishable_3uRUVhpMMNZADpjWdqo-ag_ymOp3sAR";

// Load from environment with provided values as fallbacks
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_SQL_SETUP = `-- Create the appointments table in Supabase SQL Editor
create table if not exists appointments (
  id text primary key,
  "doctorId" text not null,
  "doctorName" text not null,
  "doctorSpecialty" text not null,
  "doctorImage" text not null,
  "patientName" text not null,
  "patientEmail" text not null,
  "patientPhone" text not null,
  "patientAge" integer not null,
  "patientGender" text not null,
  "date" text not null,
  "timeSlot" text not null,
  "symptoms" text not null,
  "visitType" text not null,
  "status" text not null,
  "createdAt" text not null
);

-- Enable RLS (optional but recommended)
alter table appointments enable row level security;

-- Create policy to allow all anonymous access for this applet
create policy "Allow public read/write access" on appointments
  for all using (true) with check (true);`;

/**
 * Fetch all appointments from Supabase
 */
export async function fetchAppointmentsFromSupabase(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }
  return (data || []) as Appointment[];
}

/**
 * Save a new appointment to Supabase
 */
export async function saveAppointmentToSupabase(appointment: Appointment): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert([appointment])
    .select();

  if (error) {
    throw error;
  }
  return appointment;
}

/**
 * Update an existing appointment in Supabase (status or date/time)
 */
export async function updateAppointmentInSupabase(
  id: string,
  updates: Partial<Appointment>
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id);

  if (error) {
    throw error;
  }
}
