import { z } from "zod";

export const buildSchema = z.object({
  carModel: z.string().min(2, "Car model is required"),
  budget: z.string().min(1, "Budget is required"),
  goal: z.string().min(1, "Goal is required"),
});

export type BuildInput = z.infer<typeof buildSchema>;
