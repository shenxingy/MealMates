import { NextResponse } from "next/server";
// import { supabase } from "@mealmates/db/supabase-client";
import { supabase } from "@mealmates/db/client";
import { PostData } from "~/app/mock/PostData";
import { Post } from "~/app/definition";

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
    id: 0,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image: data.publicUrl,
    user: formData.get("user") as string,
    time: new Date(formData.get("user") as string),
    likes: Number(formData.get("likes") as string),
    liked: formData.get("liked") as string === "true"
  }
  const res = PostData.addPost(newPost);
  return NextResponse.json({
    message: res ? "Success" : "Failure",
  });
}

export function GET() {
  const data = PostData.getPosts();
  console.log(data);
  console.log(PostData.getPost(0));
  console.log(PostData.getPost(1));
  console.log(PostData.getPost(2));
  return NextResponse.json({
    data: data,
    message: "Success",
  });
}