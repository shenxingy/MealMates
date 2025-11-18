import * as SecureStore from "expo-secure-store";

const USER_ID_KEY = "mealmates_user_id";
const USERNAME_KEY = "mealmates_username";

export const getStoredUserId = async () => {
  try {
    return await SecureStore.getItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("[USER STORAGE] Failed to read user id:", error);
    return null;
  }
};

export const setStoredUserId = async (userId: string) => {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
  } catch (error) {
    console.error("[USER STORAGE] Failed to persist user id:", error);
  }
};

export const clearStoredUserId = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("[USER STORAGE] Failed to clear user id:", error);
  }
};

export const getStoredUsername = async () => {
  try {
    return await SecureStore.getItemAsync(USERNAME_KEY);
  } catch (error) {
    console.error("[USER STORAGE] Failed to read username:", error);
    return null;
  }
};

export const setStoredUsername = async (username: string) => {
  try {
    await SecureStore.setItemAsync(USERNAME_KEY, username);
  } catch (error) {
    console.error("[USER STORAGE] Failed to persist username:", error);
  }
};

export const clearStoredUsername = async () => {
  try {
    await SecureStore.deleteItemAsync(USERNAME_KEY);
  } catch (error) {
    console.error("[USER STORAGE] Failed to clear username:", error);
  }
};
