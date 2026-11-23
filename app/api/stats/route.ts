import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";

export async function GET() {
  try {
    const [models, companies, providers, benchmarks] = await Promise.all([
      prisma.model.count({ where: { status: "ACTIVE" } }),
      prisma.company.count(),
      prisma.provider.count(),
      prisma.benchmark.count(),
    ]);
    return ok({ models, companies, providers, benchmarks });
  } catch (error) {
    return fail(error);
  }
}
