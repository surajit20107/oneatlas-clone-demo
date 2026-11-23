import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { z } from "zod";
export async function GET(request: Request) {
  try {
    const q = z
      .string()
      .trim()
      .max(100)
      .optional()
      .parse(new URL(request.url).searchParams.get("q") || undefined);
    const companies = await prisma.company.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : {},
      include: {
        _count: { select: { models: true } },
        models: {
          orderBy: { releaseDate: "desc" },
          take: 1,
          select: { name: true, slug: true, releaseDate: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return ok(companies);
  } catch (error) {
    return fail(error);
  }
}
