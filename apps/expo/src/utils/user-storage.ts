import * as SecureStore from "expo-secure-store";

const USER_ID_KEY = "mealmates_user_id";

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
