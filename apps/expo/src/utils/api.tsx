import type { AxiosError, AxiosResponse } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import axios from "axios";
import superjson from "superjson";

import type { AppRouter } from "@mealmates/api";

import type { ApiResponse, SimpleEventDTO, Post, PostComment } from "~/definition";
import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

export const DEFAULT_USER_AVATAR =
  "https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_default.png";

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Response was received but with a status code outside 2xx
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error("401 Unauthorized: Token is invalid.");
          break;

        case 403:
          console.error("403 Forbidden: User does not have permission.");
          break;

        case 404:
          console.error("404 Not Found:", error.config?.url);
          break;

        case 500:
          console.error("500 Internal Server Error:", data);
          break;
        case 502:
          console.error("502 Bad Gateway:", data);
          break;
        case 503:
          console.error("503 Service Unavailable:", data);
          break;

        default:
          // Other errors
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      console.error("Network Error: No response received.", error.request);
      // Request was made but no response received
    } else {
      // Error setting up the request
      console.error("Axios Config Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
        colorMode: "ansi",
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          const headers = new Map<string, string>();
          headers.set("x-trpc-source", "expo-react");

          const cookies = authClient.getCookie();
          if (cookies) {
            headers.set("Cookie", cookies);
          }
          return headers;
        },
      }),
    ],
  }),
  queryClient,
});

export { type RouterInputs, type RouterOutputs } from "@mealmates/api";

export const fetchSimpleEventList = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
  const res = await api.get<ApiResponse<SimpleEventDTO[]>>("/events/list");
  return res.data.data;
};

export const fetchPostList = async () => {
  const res = await api.get<ApiResponse<Post[]>>("/posts/list");
  return res.data.data;
};

export const fetchPost = async (id: number) => {
  const res = await api.get<ApiResponse<Post>>("/posts/" + id);
  return res.data.data;
};

export const fetchPostComments = async (id: number) => {
  const res = await api.get<ApiResponse<PostComment[]>>("/posts/" + id + "/comments");
  return res.data.data;
};

// export const createPost = async (formData: FormData) => {
//   const res = await api.post<ApiResponse<any>>("/posts", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     }
//   });
//   console.log("done");
//   console.log(res);
//   return res.data.message;
// }