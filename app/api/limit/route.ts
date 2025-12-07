import { NextResponse } from "next/server";

import { getTotalFile, TOTAL_LIMIT } from "@/lib/fileCounter";

export const runtime = "nodejs";

export async function GET() {
  const total = getTotalFile();
  return NextResponse.json({ total, available: true, limit: TOTAL_LIMIT });
}
