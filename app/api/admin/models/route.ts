import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  modelIdentifier: z.string().trim().min(2).max(180),
  companyId: z.string().min(1),
  description: z.string().max(2000).optional(),
  modelFamily: z.string().max(80).optional(),
  contextWindow: z.number().int().positive().optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  isOpenSource: z.boolean().default(false),
  license: z.string().max(120).optional(),
});
function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Admin access is required" },
    },
    { status: 401 },
  );
}
export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) return unauthorized();
    const [models, companies] = await Promise.all([
      prisma.model.findMany({
        include: { company: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return ok({ models, companies });
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) return unauthorized();
    const input = createSchema.parse(await request.json());
    const model = await prisma.model.create({
      data: { ...input, isDemo: false },
    });
    return ok(model, undefined, 201);
  } catch (error) {
    return fail(error);
  }
}
