import type { DetailedEventDTO, SimpleEventDTO } from "~/app/definition";

export const simpleEventMockData: SimpleEventDTO[] = [
  {
    id: 1,
    avatarUrl:
      "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_1.jpeg",
    username: "Nagasaki Soyo",
    scheduleTime: "12:20",
    mood: "🤓",
    meetPoint: "Tsuki no mori Girls' School",
    restaurantName: "RING",
    message:
      "Hello! Let's have lunch together. Let me know if you're interested. Could be fun!",
  },
  {
    id: 2,
    avatarUrl:
      "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_2.jpeg",
    username: "Tanaka Hiroshi",
    scheduleTime: "12:30",
    mood: "😎",
    meetPoint: "Central Park Entrance",
    restaurantName: "Sushi World",
    message: "Looking forward to meeting new people for lunch!",
  },
  {
    id: 3,
    avatarUrl:
      "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_3.jpeg",
    username: "Yamamoto Aiko",
    scheduleTime: "12:40",
    meetPoint: "City Library",
    restaurantName: "Pasta Palace",
    message: "Anyone up for some Italian cuisine?",
  },
  {
    id: 4,
    username: "Kobayashi Ken",
    scheduleTime: "12:50",
    mood: "🍣",
    meetPoint: "Downtown Cafe",
    restaurantName: "Sushi Express",
    message: "Sushi lovers, let's gather for lunch!",
  },
  {
    id: 5,
    username: "Saito Mei",
    scheduleTime: "13:10",
    mood: "🥗",
    meetPoint: "University Campus",
    restaurantName: "Green Bites",
    message: "Healthy lunch meetup, anyone?",
  },
];

export const detailedEventMockData: DetailedEventDTO[] =
  simpleEventMockData.map((event): DetailedEventDTO => {
    return {
      ...event,
      meetPointCoordinates: {
        latitude: 36.00181,
        longitude: -78.940232,
      },
      restaurantCoordinates: {
        latitude: 36.00088,
        longitude: -78.940232,
      },
    };
  });
