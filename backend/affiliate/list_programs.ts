import { api } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { ListAffiliateProgramsResponse, AffiliateProgram } from "./types";

// Retrieves all affiliate programs.
export const listPrograms = api<void, ListAffiliateProgramsResponse>(
  { expose: true, method: "GET", path: "/affiliate/programs" },
  async () => {
    const programs = await affiliateDB.queryAll<AffiliateProgram>`
      SELECT 
        id, name, description, commission_rate as "commissionRate",
        cookie_duration as "cookieDuration", tracking_domain as "trackingDomain",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM affiliate_programs
      ORDER BY name ASC
    `;

    return { programs };
  }
);
