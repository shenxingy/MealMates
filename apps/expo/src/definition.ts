export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface SimpleEventDTO {
  id: number;
  avatarUrl?: string;
  username: string;
  scheduleTime: string;
  mood?: string;
  meetPoint: string;
  restaurantName: string;
  message?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image: string;
  user: string;
  time: string;
  likes: number;
  liked: boolean;
}

export interface PostComment {
  content: string;
  image: string | undefined;
  user: string;
  likes: number;
  liked: boolean;
}