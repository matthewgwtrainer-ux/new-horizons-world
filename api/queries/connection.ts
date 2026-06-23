import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@db/schema";
import { env } from "../lib/env";
import fs from "fs";
import path from "path";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbConnectionError: Error | null = null;

function connectDatabase() {
  if (dbInstance) return dbInstance;
  if (dbConnectionError) throw dbConnectionError;

  const dbPath = env.databasePath;

  try {
    // Ensure the data directory exists (only for local dev; on Render the disk mount creates it)
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch (mkdirErr: any) {
        // On Render, the disk mount may not be ready yet — don't crash, just log
        if (env.isProduction) {
          console.warn("Database directory not ready yet (disk mounting):", mkdirErr.message);
        } else {
          throw mkdirErr;
        }
      }
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
    console.log("SQLite database connected at:", dbPath);
    return dbInstance;
  } catch (err: any) {
    dbConnectionError = err;
    console.error("Failed to connect to SQLite database:", err.message);
    throw err;
  }
}

// Lazy database access — only connects when first called
export function getDb() {
  return connectDatabase();
}

// Backward-compatible export (also lazy)
export const db = {
  get query() { return getDb().query; },
  get select() { return getDb().select; },
  get insert() { return getDb().insert; },
  get update() { return getDb().update; },
  get delete() { return getDb().delete; },
} as any;
