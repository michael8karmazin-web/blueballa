import { z } from "zod";

// already have input? keep it.
// export const buildSchema = z.object({ ... })

export const BuildPlanSchema = z.object({
  vehicle: z.object({
    label: z.string(),          // "2012 Mazda3 2.5L"
    smog_required: z.boolean(), // model's guess based on goal
  }),
  budget_usd: z.number().int().nonnegative(),
  intent: z.enum(["handling", "power", "mixed"]),
  stages: z.array(z.object({
    name: z.string(),           // "Stage 0.5 — Baseline"
    items: z.array(z.object({
      category: z.string(),     // "tires", "intake", "brakes", etc.
      part: z.string(),         // "NGK Iridium plugs"
      brand_examples: z.array(z.string()).default([]),
      est_price_usd: z.number().optional(),
      requires_tune: z.boolean().optional(),
      smog_legal: z.boolean().optional(),
      install_difficulty_1to5: z.number().min(1).max(5).optional(),
      notes: z.string().optional(),
    })),
    est_gain_whp: z.string().optional(),   // e.g. "+8–12 whp" or "—"
    subtotal_usd: z.number().optional(),
  })),
  budget_summary: z.object({
    parts_total_usd: z.number(),
    comment: z.string().optional(),
  })
});

export type BuildPlan = z.infer<typeof BuildPlanSchema>;
