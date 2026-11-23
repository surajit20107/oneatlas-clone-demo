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
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        models: {
          include: {
            company: true,
            pricing: { where: { effectiveTo: null }, take: 1 },
            providers: { include: { provider: true } },
            capabilities: { include: { capability: true } },
            modalities: { include: { modality: true } },
          },
          orderBy: { releaseDate: "desc" },
        },
      },
    });
    return company ? ok(company) : notFound("Company");
  } catch (error) {
    return fail(error);
  }
}
