import { Post, PostComment } from '../definition';

export class PostData {
  private static postMockData: Post[] = [
    {
      id: 0,
      title: 'Today\'s Skillet!',
      content: 'Today\'s food was fantastic',
      image: 'https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Post/steak.jpg',
      user: 'user0',
      time: new Date('2025-11-10T08:50:30'),
      likes: 10,
      liked: true
    },
    {
      id: 1,
      title: 'vege curry',
      content: 'Tandoor has vege curry today',
      image: 'https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Post/curry.jpg',
      user: 'user3',
      time: new Date('2025-11-09T18:50:30'),
      likes: 0,
      liked: false
    },
    {
      id: 2,
      title: 'Wonderful!',
      content: '',
      image: 'https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Post/hotpot.webp',
      user: 'user2',
      time: new Date('2025-11-09T12:10:30'),
      likes: 100,
      liked: false
    }
  ]

  private static postCommentsMockData: PostComment[][] = [
    [],
    [
      {
        id: 0,
        content: 'I ate well today too',
        image: 'https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Post/steak.jpg',
        user: 'user1',
        likes: 6,
        liked: true
      },
      {
        id: 1,
        content: 'looks great',
        image: undefined,
        user: 'user3',
        likes: 8,
        liked: false
      }
    ],
    [
      {
        id: 0,
        content: 'I\'ll try it',
        image: undefined,
        user: 'user3',
        likes: 0,
        liked: false
      }
    ]
  ]
    
  public static getPosts(): Post[] {
    return PostData.postMockData;
  }
  
  public static getPost(idx: number): Post | undefined {
    return PostData.postMockData[idx];
  }
  
  public static getComments(idx: number): PostComment[] | undefined {
    return PostData.postCommentsMockData[idx];
  }
  
  public static addPost(post: Post): boolean {
    post.id = PostData.postMockData.length;
    PostData.postMockData.push(post);
    PostData.postCommentsMockData.push([]);
    return true;
  }
  
  public static addComment(idx: number, comment: PostComment): boolean {
    if (!PostData.postCommentsMockData[idx]) {
      return false;
    }
    comment.id = PostData.postCommentsMockData[idx].length;
    PostData.postCommentsMockData[idx].push(comment);
    return true;
  }
  
  public static likePost(idx: number): boolean {
    if (!PostData.postMockData[idx] || PostData.postMockData[idx].liked) {
      return false;
    }
    PostData.postMockData[idx].likes++;
    PostData.postMockData[idx].liked = true;
    return true;
  }
  
  public static dislikePost(idx: number): boolean {
    if (!PostData.postMockData[idx] || !PostData.postMockData[idx].liked) {
      return false;
    }
    PostData.postMockData[idx].likes--;
    PostData.postMockData[idx].liked = false;
    return true;
  }

  public static likeComment(postId: number, commentId: number): boolean {
    if (!PostData.postCommentsMockData[postId] ||
      !PostData.postCommentsMockData[postId][commentId] ||
      PostData.postCommentsMockData[postId][commentId].liked
    ) {
      return false;
    }
    PostData.postCommentsMockData[postId][commentId].likes++;
    PostData.postCommentsMockData[postId][commentId].liked = true;
    return true;
  }
  
  public static dislikeComment(postId: number, commentId: number): boolean {
    if (!PostData.postCommentsMockData[postId] ||
      !PostData.postCommentsMockData[postId][commentId] ||
      !PostData.postCommentsMockData[postId][commentId].liked
    ) {
      return false;
    }
    PostData.postCommentsMockData[postId][commentId].likes--;
    PostData.postCommentsMockData[postId][commentId].liked = false;
    return true;
  }
}