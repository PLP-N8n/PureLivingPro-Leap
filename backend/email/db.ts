import { SQLDatabase } from "encore.dev/storage/sqldb";

export const emailDB = new SQLDatabase("email", {
  migrations: "./migrations",
});
