import { SQLDatabase } from "encore.dev/storage/sqldb";

// Auth database for user authentication and authorization
export const authDB = new SQLDatabase("auth", {
  migrations: "./migrations",
});
