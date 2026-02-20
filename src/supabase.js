import { createClient } from '@supabase/supabase-js'

// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://uvznwjflmgivoygveada.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2em53amZsbWdpdm95Z3ZlYWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTcxMTAsImV4cCI6MjA4NzEzMzExMH0.VNdescxKrA--9le3gnpvNcPL2RFDtREO2Gl7V8kCeMo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
