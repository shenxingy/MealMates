import type { SimpleEventDTO, Post, PostComment } from "~/app/definition";

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

export let postMockData: Post[] = [
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

export const postCommentsMockData: PostComment[][] = [
  [],
  [
    {
      content: 'I ate well today too',
      image: 'https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Post/steak.jpg',
      user: 'user1',
      likes: 6,
      liked: true
    },
    {
      content: 'looks great',
      image: undefined,
      user: 'user3',
      likes: 8,
      liked: false
    }
  ],
  [
    {
      content: 'I\'ll try it',
      image: undefined,
      user: 'user3',
      likes: 0,
      liked: false
    }
  ]
]