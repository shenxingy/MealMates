import { NextResponse } from "next/server";
// import { supabase } from "@mealmates/db/supabase-client";
import { supabase } from "@mealmates/db/client";
// import { postMockData } from "~/app/mock/mock";
import { Post } from "~/app/definition";

export var postData: Post[] = [];

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // // Convert to ArrayBuffer -> Buffer
  // const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${Date.now()}-${file.name}`;
  // Upload to Supabase Storage
  // console.log("storing");
  const { error } = await supabase.storage
    .from("Post")
    .upload(fileName, file);
  if (error) {
    console.log(error);
    return NextResponse.json({
      message: "Error",
    });
  }
  const { data } = await supabase.storage
    .from("Post")
    .getPublicUrl(fileName);
  const newPost: Post = {
    id: postData.length,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image: data.publicUrl,
    user: formData.get("user") as string,
    time: new Date(formData.get("user") as string),
    likes: Number(formData.get("title") as string),
    liked: formData.get("title") as string === "true"
  }
  postData.push(newPost);
  console.log(postData);
  return NextResponse.json({
    message: "Success",
  });
}

export function GET() {
  console.log(postData);
  return NextResponse.json({
    data: postData,
    message: "Success",
  });
}