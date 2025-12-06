import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { CreateAffiliateProgramRequest, AffiliateProgram } from "./types";

// Creates a new affiliate program.
export const createProgram = api<CreateAffiliateProgramRequest, AffiliateProgram>(
  { expose: true, method: "POST", path: "/affiliate/programs" },
  async (req) => {
    const program = await affiliateDB.queryRow<AffiliateProgram>`
      INSERT INTO affiliate_programs (
        name, description, commission_rate, cookie_duration, tracking_domain, is_active
      ) VALUES (
        ${req.name}, ${req.description || null}, ${req.commissionRate},
        ${req.cookieDuration || 30}, ${req.trackingDomain || null},
        ${req.isActive === undefined ? true : req.isActive}
      )
      RETURNING id, name, description, commission_rate as "commissionRate",
                cookie_duration as "cookieDuration", tracking_domain as "trackingDomain",
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!program) {
      throw APIError.internal("Failed to create affiliate program");
    }

    return program;
  }
);
