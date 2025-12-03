export interface SimpleEventDTO {
  id: number;
  avatarUrl?: string;
  username: string;
  scheduleTime: string;
  mood?: string;
  emoji?: string;
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
