import { SQLDatabase } from "encore.dev/storage/sqldb";

export const affiliateDB = new SQLDatabase("affiliate", {
  migrations: "./migrations",
});
