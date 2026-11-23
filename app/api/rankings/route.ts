import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const filters = z
      .object({
        category: z
          .enum([
            "GENERAL",
            "REASONING",
            "CODING",
            "MATHEMATICS",
            "VISION",
            "OTHER",
          ])
          .optional(),
        company: z.string().trim().max(100).optional(),
        provider: z.string().trim().max(100).optional(),
        openSource: z.enum(["true", "false"]).optional(),
      })
      .parse(Object.fromEntries(params));
    const rows = await prisma.benchmarkResult.findMany({
      where: {
        ...(filters.category
          ? { benchmark: { category: filters.category } }
          : {}),
        ...(filters.company || filters.provider || filters.openSource
          ? {
              model: {
                ...(filters.company
                  ? { company: { slug: filters.company } }
                  : {}),
                ...(filters.provider
                  ? {
                      providers: {
                        some: {
                          provider: { slug: filters.provider },
                          isAvailable: true,
                        },
                      },
                    }
                  : {}),
                ...(filters.openSource
                  ? { isOpenSource: filters.openSource === "true" }
                  : {}),
              },
            }
          : {}),
      },
      include: {
        model: {
          include: {
            company: true,
            pricing: {
              where: { effectiveTo: null },
              orderBy: { inputPricePerMillionTokens: "asc" },
              take: 1,
            },
            providers: { where: { isAvailable: true } },
          },
        },
        benchmark: true,
      },
      orderBy: [{ evaluationDate: "desc" }, { score: "desc" }],
      take: 200,
    });
    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const key = `${row.modelId}:${row.benchmarkId}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const sorted = [...latest.values()].sort(
      (a, b) =>
        a.benchmark.name.localeCompare(b.benchmark.name) ||
        Number(b.score) - Number(a.score),
    );
    const ranks = new Map<string, number>();
    return ok(
      sorted.map((row) => {
        const rank = (ranks.get(row.benchmarkId) ?? 0) + 1;
        ranks.set(row.benchmarkId, rank);
        return { rank, ...row };
      }),
    );
  } catch (error) {
    return fail(error);
  }
}
