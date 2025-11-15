import { NextResponse } from "next/server";

import { postMockData } from "~/app/mock/mock";

export function GET() {
  return NextResponse.json({
    data: postMockData,
    message: "Success",
  });
}
