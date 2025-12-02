// import { NextResponse } from "next/server";

// import type { Post } from "~/app/definition";
// import { PostData } from "~/app/mock/PostData";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ postId: number }> },
// ) {
//   const { postId } = await params;
//   const data: Post | undefined = PostData.getPost(postId);
//   return NextResponse.json({
//     data: data,
//     message: "Success",
//   });
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ postId: number }> },
// ) {
//   const { postId } = await params;
//   const { like } = (await req.json()) as { like: boolean };
//   const res = like ? PostData.likePost(postId) : PostData.dislikePost(postId);
//   return NextResponse.json({
//     message: res ? "Success" : "Failure",
//   });
// }
