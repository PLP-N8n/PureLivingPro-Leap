import { SQLDatabase } from "encore.dev/storage/sqldb";

export const DB = new SQLDatabase("health", {
  migrations: "./migrations",
});