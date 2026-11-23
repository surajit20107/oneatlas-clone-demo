import { z } from "zod";

export const listQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  company: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  capabilities: z.string().trim().optional(),
  modalities: z.string().trim().optional(),
  openSource: z.enum(["true", "false"]).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minContext: z.coerce.number().int().nonnegative().optional(),
  maxContext: z.coerce.number().int().nonnegative().optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "inputPrice",
      "outputPrice",
      "context",
      "name",
      "popular",
    ])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
