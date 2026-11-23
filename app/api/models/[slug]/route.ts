import { prisma } from "@/lib/prisma";
import { fail, notFound, ok } from "@/lib/server/http";
import { z } from "zod";

const relatedInclude = {
  company: true,
  providers: { where: { isAvailable: true }, include: { provider: true } },
  capabilities: { include: { capability: true } },
  modalities: { include: { modality: true } },
  pricing: { where: { effectiveTo: null }, take: 1 },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = z
      .object({ slug: z.string().min(1).max(160) })
      .parse(await params);
    const model = await prisma.model.findUnique({
      where: { slug },
      include: {
        company: true,
        providers: { include: { provider: true } },
        capabilities: { include: { capability: true } },
        modalities: { include: { modality: true } },
        pricing: {
          include: { provider: true },
          orderBy: { effectiveFrom: "desc" },
        },
        benchmarkResults: {
          include: { benchmark: true },
          orderBy: { evaluationDate: "desc" },
        },
        releases: { orderBy: { releaseDate: "desc" } },
      },
    });
    if (!model) return notFound("Model");
    const relatedModels = await prisma.model.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: slug },
        OR: [
          { companyId: model.companyId },
          ...(model.modelFamily ? [{ modelFamily: model.modelFamily }] : []),
        ],
      },
      include: relatedInclude,
      take: 3,
      orderBy: { releaseDate: "desc" },
    });
    return ok({ ...model, relatedModels });
  } catch (error) {
    return fail(error);
  }
}
