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
    const providers = await prisma.provider.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : {},
      include: { _count: { select: { modelListings: true } } },
      orderBy: { name: "asc" },
    });
    return ok(providers);
  } catch (error) {
    return fail(error);
  }
}
