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
