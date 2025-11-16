import { NextResponse } from "next/server";
// import { supabase } from "@mealmates/db/supabase-client";
import { supabase } from "@mealmates/db/client";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

    // Convert to ArrayBuffer -> Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${Date.now()}-${file.name}`;
  // Upload to Supabase Storage
  console.log("storing");
  const { data, error } = await supabase.storage
    .from("Post")
    // .upload(fileName, buffer, {
    //   contentType: file.type,
    // });
    .upload(fileName, file);
  if (error) {
    console.log(error);
    return NextResponse.json({
    message: "Error",
    });
  }
  return NextResponse.json({
    message: "Success",
  });
}
