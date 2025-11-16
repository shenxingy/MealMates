import { NextResponse } from "next/server";

export function POST() {
  console.log("get post request");
  return NextResponse.json({
    // data: "data",
    message: "Success",
  });
}
