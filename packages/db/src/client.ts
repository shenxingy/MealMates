import { createClient } from "@supabase/supabase-js";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "./schema";

export const db = drizzle({
  client: sql,
  schema,
  casing: "snake_case",
});

export const supabase = createClient(
  "https://rcucryvgjbthzoirnzam.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdWNyeXZnamJ0aHpvaXJuemFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzIyMjUsImV4cCI6MjA3Njc0ODIyNX0.SvnP8iRkgJ7B4KHAC7TY3SWNSv-aP8BiXtr4WvN5SLI",
);
