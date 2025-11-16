import { NextResponse } from "next/server";

import { postData } from "../route";

export function GET() {
  console.log(postData);
  return NextResponse.json({
    data: postData,
    message: "Success",
  });
}
