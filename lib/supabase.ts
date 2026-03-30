import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vaxszpsdzbdmzzfixfzk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheHN6cHNkemJkbXp6Zml4ZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTY2NDgsImV4cCI6MjA5MDQzMjY0OH0.j8_pjV3VLBaiDUcb9b2tUl1X1P9WcJ7yzidv-7e1XoY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
