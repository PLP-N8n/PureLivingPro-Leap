import { SQLDatabase } from "encore.dev/storage/sqldb";

export const newsletterDB = new SQLDatabase("newsletter", {
  migrations: "./migrations",
});
