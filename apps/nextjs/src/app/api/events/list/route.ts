import { NextResponse } from "next/server";

import { simpleEventMockData } from "~/app/mock/mock";

export function GET() {
  return NextResponse.json({
    data: simpleEventMockData,
    message: "Success",
  });
}
