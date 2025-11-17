import { NextResponse } from "next/server";
import { supabase } from "@mealmates/db/client";
import { PostComment } from "~/app/definition";
import { PostData } from "~/app/mock/PostData";

export async function GET(
  req: Request,
  { params }: { params: { postId: number } | Promise<{ postId: number }> }
) {
  const { postId } = await params;
  console.log("getting comments");
  const data: PostComment[] | undefined = PostData.getComments(postId);
  return NextResponse.json({
    data: data,
    message: data? "Success" : "Failure",
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  
  let imgUrl: string = "";

  if (file) {
    const fileName = `${Date.now()}-${file.name}`;
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
    imgUrl = data.publicUrl;
  }

  const newComment: PostComment = {
    id: 0,
    content: formData.get("content") as string,
    image: imgUrl,
    user: formData.get("user") as string,
    likes: Number(formData.get("title") as string),
    liked: formData.get("title") as string === "true"
  }
  PostData.addComment(Number(formData.get("post") as string), newComment);
  return NextResponse.json({
    message: "Success",
  });
}