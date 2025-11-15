import { NextResponse } from "next/server";

import { postCommentsMockData } from "~/app/mock/mock";

export async function GET(
  req: Request,
  { params }: { params: { id: number } | Promise<{ id: number }> }
) {
  const { id } = await params;
  return NextResponse.json({
    data: postCommentsMockData[id],
    message: "Success",
  });
}
