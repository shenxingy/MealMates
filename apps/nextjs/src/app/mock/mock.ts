import type { DetailedEventDTO, SimpleEventDTO } from "~/app/definition";

export const simpleEventMockData: SimpleEventDTO[] = [
  {
    id: 1,
    avatarUrl:
      "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_1.jpeg",
    username: "Nagasaki Soyo",
    scheduleTime: "12:20",
    mood: "🤓",
    status: "waiting_for_participant",
    emoji: "🍜",
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
    status: "waiting_for_participant",
    emoji: "🍣",
    restaurantName: "Sushi World",
    message: "Looking forward to meeting new people for lunch!",
  },
  {
    id: 3,
    avatarUrl:
      "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_3.jpeg",
    username: "Yamamoto Aiko",
    scheduleTime: "12:40",
    status: "waiting_for_participant",
    emoji: "🍝",
    restaurantName: "Pasta Palace",
    message: "Anyone up for some Italian cuisine?",
  },
  {
    id: 4,
    username: "Kobayashi Ken",
    scheduleTime: "12:50",
    mood: "🍣",
    status: "waiting_for_participant",
    emoji: "🍱",
    restaurantName: "Sushi Express",
    message: "Sushi lovers, let's gather for lunch!",
  },
  {
    id: 5,
    username: "Saito Mei",
    scheduleTime: "13:10",
    mood: "🥗",
    status: "waiting_for_participant",
    emoji: "🥗",
    restaurantName: "Green Bites",
    message: "Healthy lunch meetup, anyone?",
  },
];

export const detailedEventMockData: DetailedEventDTO[] = [
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...simpleEventMockData[0]!,
    meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 },
    restaurantCoordinates: { latitude: 36.01126, longitude: -78.92182 },
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...simpleEventMockData[1]!,
    meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 },
    restaurantCoordinates: { latitude: 36.01126, longitude: -78.88182 },
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...simpleEventMockData[2]!,
    meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 },
    restaurantCoordinates: { latitude: 36.00162, longitude: -78.93363 },
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...simpleEventMockData[3]!,
    meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 },
    restaurantCoordinates: { latitude: 36.00162, longitude: -78.93853 },
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...simpleEventMockData[4]!,
    meetPointCoordinates: { latitude: 40.7128, longitude: -74.006 },
    restaurantCoordinates: { latitude: 40.713, longitude: -74.0062 },
  },
];
