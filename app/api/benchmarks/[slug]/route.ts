import { prisma } from "@/lib/prisma";
import { fail, notFound, ok } from "@/lib/server/http";
import { z } from "zod";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = z
      .object({ slug: z.string().min(1).max(160) })
      .parse(await params);
    const benchmark = await prisma.benchmark.findUnique({
      where: { slug },
      include: {
        results: {
          include: { model: { include: { company: true } } },
          orderBy: { evaluationDate: "desc" },
          take: 100,
        },
      },
    });
    return benchmark ? ok(benchmark) : notFound("Benchmark");
  } catch (error) {
    return fail(error);
  }
}
