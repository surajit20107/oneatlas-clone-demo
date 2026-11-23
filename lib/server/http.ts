import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status },
  );
}

export function notFound(resource = "Resource") {
  return NextResponse.json(
    {
      success: false,
      error: { code: "NOT_FOUND", message: `${resource} not found` },
    },
    { status: 404 },
  );
}

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request parameters are invalid",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  console.error("[OneAtlas API] Request failed", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to complete the request",
      },
    },
    { status: 500 },
  );
}
