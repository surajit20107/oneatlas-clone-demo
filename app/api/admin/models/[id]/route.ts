import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  modelIdentifier: z.string().trim().min(2).max(180).optional(),
  companyId: z.string().min(1).optional(),
  description: z.string().max(2000).nullable().optional(),
  modelFamily: z.string().max(80).nullable().optional(),
  contextWindow: z.number().int().positive().nullable().optional(),
  maxOutputTokens: z.number().int().positive().nullable().optional(),
  isOpenSource: z.boolean().optional(),
  license: z.string().max(120).nullable().optional(),
  status: z.enum(["ACTIVE", "DEPRECATED", "PREVIEW", "RETIRED"]).optional(),
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
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isAdminRequest(request)) return unauthorized();
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    return ok(await prisma.model.update({ where: { id }, data: input }));
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isAdminRequest(request)) return unauthorized();
    z.literal("true").parse(new URL(request.url).searchParams.get("confirm"));
    const { id } = await params;
    return ok(await prisma.model.delete({ where: { id } }));
  } catch (error) {
    return fail(error);
  }
}
