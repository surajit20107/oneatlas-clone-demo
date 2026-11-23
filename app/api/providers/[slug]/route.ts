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
    const provider = await prisma.provider.findUnique({
      where: { slug },
      include: {
        modelListings: {
          include: {
            model: {
              include: {
                company: true,
                pricing: { where: { effectiveTo: null }, take: 1 },
                capabilities: { include: { capability: true } },
                modalities: { include: { modality: true } },
                providers: { include: { provider: true } },
              },
            },
          },
          orderBy: { model: { name: "asc" } },
        },
      },
    });
    return provider ? ok(provider) : notFound("Provider");
  } catch (error) {
    return fail(error);
  }
}
