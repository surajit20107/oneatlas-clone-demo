import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { listQuerySchema } from "@/lib/server/validation";

const includeModel = {
  company: true,
  providers: { where: { isAvailable: true }, include: { provider: true } },
  capabilities: { include: { capability: true } },
  modalities: { include: { modality: true } },
  pricing: {
    where: { effectiveTo: null },
    orderBy: { inputPricePerMillionTokens: "asc" as const },
    take: 1,
  },
};

export async function GET(request: Request) {
  try {
    const query = listQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const terms = query.search?.split(/\s+/).filter(Boolean) ?? [];
    const where: Prisma.ModelWhereInput = {
      status: "ACTIVE",
      ...(query.openSource
        ? { isOpenSource: query.openSource === "true" }
        : {}),
      ...(query.company ? { company: { slug: query.company } } : {}),
      ...(query.provider
        ? {
            providers: {
              some: { provider: { slug: query.provider }, isAvailable: true },
            },
          }
        : {}),
      ...(query.capabilities
        ? {
            capabilities: {
              some: { capability: { slug: query.capabilities } },
            },
          }
        : {}),
      ...(query.modalities
        ? { modalities: { some: { modality: { slug: query.modalities } } } }
        : {}),
      ...(query.minContext !== undefined || query.maxContext !== undefined
        ? { contextWindow: { gte: query.minContext, lte: query.maxContext } }
        : {}),
      ...(terms.length
        ? {
            AND: terms.map((term) => ({
              OR: [
                { name: { contains: term, mode: "insensitive" } },
                { modelIdentifier: { contains: term, mode: "insensitive" } },
                { company: { name: { contains: term, mode: "insensitive" } } },
                { modelFamily: { contains: term, mode: "insensitive" } },
                { description: { contains: term, mode: "insensitive" } },
                {
                  capabilities: {
                    some: {
                      capability: {
                        name: { contains: term, mode: "insensitive" },
                      },
                    },
                  },
                },
                {
                  modalities: {
                    some: {
                      modality: {
                        name: { contains: term, mode: "insensitive" },
                      },
                    },
                  },
                },
              ],
            })),
          }
        : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            pricing: {
              some: {
                effectiveTo: null,
                inputPricePerMillionTokens: {
                  gte: query.minPrice,
                  lte: query.maxPrice,
                },
              },
            },
          }
        : {}),
    };
    const total = await prisma.model.count({ where });
    let models;
    if (query.sort === "inputPrice" || query.sort === "outputPrice") {
      const isInput = query.sort === "inputPrice";
      const field = isInput
        ? "inputPricePerMillionTokens"
        : "outputPricePerMillionTokens";
      const orderBy = isInput
        ? { _min: { inputPricePerMillionTokens: "asc" as const } }
        : { _min: { outputPricePerMillionTokens: "asc" as const } };
      const priced = await prisma.pricing.groupBy({
        by: ["modelId"],
        where: { effectiveTo: null, model: where, [field]: { not: null } },
        _min: { [field]: true },
        orderBy,
      });
      const missing = await prisma.model.findMany({
        where: {
          AND: [
            where,
            {
              pricing: { none: { effectiveTo: null, [field]: { not: null } } },
            },
          ],
        },
        orderBy: { name: "asc" },
        select: { id: true },
      });
      const orderedIds = [
        ...priced.map((item) => item.modelId),
        ...missing.map((item) => item.id),
      ];
      const pageIds = orderedIds.slice(
        (query.page - 1) * query.limit,
        query.page * query.limit,
      );
      const found = await prisma.model.findMany({
        where: { id: { in: pageIds } },
        include: includeModel,
      });
      const byId = new Map(found.map((model) => [model.id, model]));
      models = pageIds
        .map((id) => byId.get(id))
        .filter((model) => model !== undefined);
    } else {
      const orderBy: Prisma.ModelOrderByWithRelationInput =
        query.sort === "oldest"
          ? { releaseDate: "asc" }
          : query.sort === "context"
            ? { contextWindow: "desc" }
            : query.sort === "name"
              ? { name: "asc" }
              : query.sort === "popular"
                ? { providers: { _count: "desc" } }
                : { releaseDate: "desc" };
      models = await prisma.model.findMany({
        where,
        include: includeModel,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });
    }
    return ok(models, {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    });
  } catch (error) {
    return fail(error);
  }
}
