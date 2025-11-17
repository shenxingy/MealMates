import { NextResponse } from "next/server";
import { Post } from "~/app/definition";
import { PostData } from "~/app/mock/PostData";

export async function GET(
  req: Request,
  { params }: { params: { postId: number } | Promise<{ postId: number }> }
) {
  const { postId } = await params;
  const data: Post | undefined = PostData.getPost(postId);
  return NextResponse.json({
    data: data,
    message: "Success",
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { postId: number } | Promise<{ postId: number }> }
) {
  const { postId } = await params;
  const { like } = await req.json();
  // console.log("id: " + id + ", like: " + like);
  const res = like ? PostData.likePost(postId) : PostData.dislikePost(postId);
  return NextResponse.json({
    message: res ? "Success" : "Failure",
  });
}