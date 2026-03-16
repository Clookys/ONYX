import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlaegnxttrfhzhictuqp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYWVnbnh0dHJmaHpoaWN0dXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzYwNTAsImV4cCI6MjA4ODQ1MjA1MH0.yQX1zBDlN5L6nx5qLEDtVa_V5ipTU8-5VM-wcuVTb1Y'

export const supabase = createClient(supabaseUrl, supabaseKey)
