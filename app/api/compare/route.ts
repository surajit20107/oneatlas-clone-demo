import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const slugs = z
      .array(z.string().min(1).max(160))
      .min(2)
      .max(4)
      .parse(new URL(request.url).searchParams.get("models")?.split(",") ?? []);
    const models = await prisma.model.findMany({
      where: { slug: { in: slugs } },
      include: {
        company: true,
        providers: { include: { provider: true } },
        capabilities: { include: { capability: true } },
        modalities: { include: { modality: true } },
        pricing: { where: { effectiveTo: null } },
        benchmarkResults: {
          include: { benchmark: true },
          orderBy: { evaluationDate: "desc" },
        },
      },
    });
    return ok(
      slugs.map((slug) => models.find((model) => model.slug === slug) ?? null),
    );
  } catch (error) {
    return fail(error);
  }
}
