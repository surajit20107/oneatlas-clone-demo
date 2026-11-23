import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const q = z
      .string()
      .trim()
      .min(1)
      .max(100)
      .parse(new URL(request.url).searchParams.get("q"));
    const contains = { contains: q, mode: "insensitive" as const };
    const [models, companies, providers] = await Promise.all([
      prisma.model.findMany({
        where: {
          status: "ACTIVE",
          OR: [{ name: contains }, { modelIdentifier: contains }],
        },
        select: {
          name: true,
          slug: true,
          modelIdentifier: true,
          company: { select: { name: true } },
        },
        take: 6,
        orderBy: { name: "asc" },
      }),
      prisma.company.findMany({
        where: { OR: [{ name: contains }, { description: contains }] },
        select: { name: true, slug: true },
        take: 4,
        orderBy: { name: "asc" },
      }),
      prisma.provider.findMany({
        where: { OR: [{ name: contains }, { description: contains }] },
        select: { name: true, slug: true },
        take: 4,
        orderBy: { name: "asc" },
      }),
    ]);
    return ok({ models, companies, providers });
  } catch (error) {
    return fail(error);
  }
}
