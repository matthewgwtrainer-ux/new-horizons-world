import "dotenv/config";

function envVar(name: string, requiredInProd = false): string {
  const value = process.env[name];
  if (!value && requiredInProd && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: envVar("APP_ID"),
  appSecret: envVar("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: envVar("DATABASE_URL"),
  databasePath: envVar("DATABASE_PATH") || "./data/app.db",
};
