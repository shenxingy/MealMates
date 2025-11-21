import { NextResponse } from "next/server";
import { PostData } from "~/app/mock/PostData";

export async function PUT(
  req: Request,
  { params }: { params: { postId: number, commentId: number } | Promise<{ postId: number, commentId: number }> }
) {
  const { postId, commentId } = await params;
  const { like } = await req.json();
  const res = like ?
    PostData.likeComment(postId, commentId) :
    PostData.dislikeComment(postId, commentId);
  return NextResponse.json({
    message: res ? "Success" : "Failure",
  });
}