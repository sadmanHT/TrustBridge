import { NextResponse } from "next/server";
import { checkChainHealth } from "@/lib/chainHealth";

export async function GET() {
  try {
    const h = await checkChainHealth();
    return NextResponse.json({ ok: true, ...h });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}