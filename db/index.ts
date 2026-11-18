import * as dotenv from "dotenv";
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
