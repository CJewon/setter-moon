import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "sellerroom-front",
    timestamp: new Date().toISOString()
  });
}
