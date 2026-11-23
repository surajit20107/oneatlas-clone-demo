import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
export async function GET() {
  try {
    const benchmarks = await prisma.benchmark.findMany({
      include: { _count: { select: { results: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return ok(benchmarks);
  } catch (error) {
    return fail(error);
  }
}
