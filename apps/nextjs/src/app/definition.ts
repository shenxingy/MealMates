export interface SimpleEventDTO {
  id: number;
  avatarUrl?: string;
  username: string;
  scheduleTime: string;
  mood?: string;
  restaurantName: string;
  message?: string;
}

export interface DetailedEventDTO extends SimpleEventDTO {
  restaurantCoordinates: {
    latitude: number;
    longitude: number;
  };
  meetPointCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image: string;
  user: string;
  time: Date;
  likes: number;
  liked: boolean;
}

export interface PostComment {
  id: number;
  content: string;
  image: string | undefined;
  user: string;
  likes: number;
  liked: boolean;
}
