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

export interface DetailedEventDTO extends SimpleEventDTO {
  meetPointCoordinates: {
    latitude: number;
    longitude: number;
  };
  // Optional, restaurant can be decided later
  restaurantCoordinates?: {
    latitude: number;
    longitude: number;
  };
}
