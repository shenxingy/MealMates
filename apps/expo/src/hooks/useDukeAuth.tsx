import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import {
  exchangeCodeAsync,
  refreshAsync,
  ResponseType,
  revokeAsync,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";

import type { DukeUserInfo } from "~/config";
import { DUKE_AUTH_CONFIG } from "~/config";
import { trpcClient } from "~/utils/api";
import {
  clearStoredUserId,
  clearStoredUsername,
  setStoredUserId,
  setStoredUsername,
} from "~/utils/user-storage";

const TOKEN_KEY = "duke_access_token";
const REFRESH_TOKEN_KEY = "duke_refresh_token";
const TOKEN_EXPIRY_KEY = "duke_token_expiry";

const extractNetIdFromSub = (sub: string) => {
  const separatorIndex = sub.indexOf("@");
  return separatorIndex === -1 ? undefined : sub.slice(0, separatorIndex);
};

type DukeAuthContextValue = ReturnType<typeof useProvideDukeAuth>;

const DukeAuthContext = createContext<DukeAuthContextValue | undefined>(
  undefined,
);

function useProvideDukeAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<DukeUserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Discovery document for Duke OAuth
  const discovery = {
    authorizationEndpoint: DUKE_AUTH_CONFIG.authorizationEndpoint,
    tokenEndpoint: DUKE_AUTH_CONFIG.tokenEndpoint,
    revocationEndpoint: DUKE_AUTH_CONFIG.revocationEndpoint,
  };

  const redirectUri = AuthSession.makeRedirectUri({
    native: "mealmates://auth/callback",
    scheme: "mealmates",
    path: "auth/callback",
  });

  // Set up the auth request
  const [_request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: DUKE_AUTH_CONFIG.clientId,
      clientSecret: DUKE_AUTH_CONFIG.clientSecret,
      scopes: DUKE_AUTH_CONFIG.scopes,
      redirectUri,
      usePKCE: false,
    },
    discovery,
  );

  // Handle the OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      if (code) {
        void exchangeCodeForToken(code);
      }
    } else if (response?.type === "error") {
      setError(response.error?.message ?? "Authentication failed");
      setIsLoading(false);
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      // User backed out of the auth flow, so reset to initial state
      setIsLoading(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  // Load stored tokens on mount
  useEffect(() => {
    void hydrateFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tokens from secure storage
  const hydrateFromStorage = async () => {
    setIsLoading(true);
    try {
      const storedAccessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedRefreshToken =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const storedExpiry = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);

      if (storedAccessToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const currentTime = Date.now();

        // Check if token is expired
        if (currentTime < expiryTime) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);

          // Fetch user info with stored token
          const userInfo = await fetchUserInfo(storedAccessToken);

          // Sync to database with stored token info
          if (userInfo) {
            const remainingSeconds = Math.floor(
              (expiryTime - currentTime) / 1000,
            );
            await syncUserToDatabase(userInfo, {
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken ?? undefined,
              expiresIn: remainingSeconds,
            });
          }
        } else if (storedRefreshToken) {
          // Token expired, try to refresh
          await refreshAccessToken(storedRefreshToken);
        }
      }
    } catch (err) {
      console.error("Error loading stored tokens:", err);
    } finally {
      setIsAuthHydrated(true);
      setIsLoading(false);
    }
  };

  // Store tokens securely
  const storeTokens = async (
    access: string,
    refresh?: string,
    expiresIn?: number,
  ) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, access);
      if (refresh) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      }
      if (expiresIn) {
        const expiryTime = Date.now() + expiresIn * 1000;
        await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (err) {
      console.error("Error storing tokens:", err);
    }
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: DUKE_AUTH_CONFIG.clientId,
          clientSecret: DUKE_AUTH_CONFIG.clientSecret,
          code,
          redirectUri,
        },
        discovery,
      );

      if (tokenResponse.accessToken) {
        setAccessToken(tokenResponse.accessToken);
        setRefreshToken(tokenResponse.refreshToken ?? null);

        await storeTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
          tokenResponse.expiresIn,
        );

        // Fetch user information and sync to database with token data
        const userInfo = await fetchUserInfo(tokenResponse.accessToken);

        // Sync again with full token information from the exchange
        if (userInfo) {
          await syncUserToDatabase(userInfo, {
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            expiresIn: tokenResponse.expiresIn,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Error exchanging code for token:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to exchange authorization code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user information from Duke
  const fetchUserInfo = async (
    token?: string,
  ): Promise<DukeUserInfo | null> => {
    const tokenToUse = token ?? accessToken;

    if (!tokenToUse) {
      setError("No access token available");
      return null;
    }

    try {
      const response = await fetch(DUKE_AUTH_CONFIG.userInfoEndpoint, {
        method: "POST",
        body: `access_token=${tokenToUse}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user info: ${response.statusText}`);
      }

      const data = (await response.json()) as DukeUserInfo;
      setUserInfo(data);

      // Note: syncUserToDatabase is called by the caller with full token info
      // Don't call it here to avoid duplicate syncs

      return data;
    } catch (err: unknown) {
      console.error("Error fetching user info:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user information";
      setError(errorMessage);
      return null;
    }
  };

  // Sync Duke user data to the database
  const syncUserToDatabase = async (
    dukeUserInfo: DukeUserInfo,
    tokenData?: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
    },
  ) => {
    try {
      console.log("[DUKE AUTH] Syncing user to database:", dukeUserInfo);

      const fallbackId =
        dukeUserInfo.dukeNetID ?? extractNetIdFromSub(dukeUserInfo.sub);

      const result = await trpcClient.user.syncDukeUser.mutate({
        sub: dukeUserInfo.sub,
        email: dukeUserInfo.email,
        name: dukeUserInfo.name,
        given_name: dukeUserInfo.given_name,
        family_name: dukeUserInfo.family_name,
        email_verified: dukeUserInfo.email_verified,
        dukeNetID: dukeUserInfo.dukeNetID,
        dukeUniqueID: dukeUserInfo.dukeUniqueID,
        dukePrimaryAffiliation: dukeUserInfo.dukePrimaryAffiliation,
        // Include OAuth tokens for server-side operations
        accessToken: tokenData?.accessToken,
        refreshToken: tokenData?.refreshToken,
        expiresIn: tokenData?.expiresIn,
      });

      if (result.success) {
        console.log(
          `[DUKE AUTH] User ${result.isNewUser ? "created" : "updated"} in database:`,
          result.user.id,
        );
        console.log(
          "[DUKE AUTH] Tokens stored in database for server-side access",
        );
        await setStoredUserId(result.user.id);
        await setStoredUsername(result.user.name);
      } else if (fallbackId) {
        await setStoredUserId(fallbackId);
        await setStoredUsername("Unknown User");
      }
    } catch (err: unknown) {
      console.error("[DUKE AUTH] Error syncing user to database:", err);
      // Don't throw - authentication can still succeed even if DB sync fails
      const fallbackId =
        dukeUserInfo.dukeNetID ?? extractNetIdFromSub(dukeUserInfo.sub);
      if (fallbackId) {
        await setStoredUserId(fallbackId);
        await setStoredUsername("Unknown User");
      }
    }
  };

  // Refresh the access token
  const refreshAccessToken = async (token?: string) => {
    const tokenToUse = token ?? refreshToken;

    if (!tokenToUse) {
      setError("No refresh token available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await refreshAsync(
        {
          clientId: DUKE_AUTH_CONFIG.clientId,
          clientSecret: DUKE_AUTH_CONFIG.clientSecret,
          refreshToken: tokenToUse,
        },
        { tokenEndpoint: DUKE_AUTH_CONFIG.tokenEndpoint },
      );

      if (tokenResponse.accessToken) {
        setAccessToken(tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
          setRefreshToken(tokenResponse.refreshToken);
        }

        await storeTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
          tokenResponse.expiresIn,
        );

        // Fetch user info and sync refreshed tokens to database
        const userInfo = await fetchUserInfo(tokenResponse.accessToken);
        if (userInfo) {
          await syncUserToDatabase(userInfo, {
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken ?? tokenToUse,
            expiresIn: tokenResponse.expiresIn,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Error refreshing token:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh access token";
      setError(errorMessage);
      // Clear tokens if refresh fails
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate login flow
  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await promptAsync();
    } catch (err: unknown) {
      console.error("Error initiating login:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate login";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Logout and revoke tokens
  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Revoke the access token if available
      if (accessToken) {
        try {
          await revokeAsync(
            {
              clientId: DUKE_AUTH_CONFIG.clientId,
              clientSecret: DUKE_AUTH_CONFIG.clientSecret,
              token: accessToken,
            },
            { revocationEndpoint: DUKE_AUTH_CONFIG.revocationEndpoint },
          );
        } catch (err) {
          console.error("Error revoking token:", err);
          // Continue with logout even if revocation fails
        }
      }

      // Clear tokens from secure storage
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
        clearStoredUserId(),
        clearStoredUsername(),
      ]);

      // Clear tokens from state and user info
      setAccessToken(null);
      setRefreshToken(null);
      setUserInfo(null);
    } catch (err: unknown) {
      console.error("Error during logout:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to logout";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    isAuthHydrated,
    isAuthenticated: !!accessToken && !!userInfo,
    accessToken,
    refreshToken,
    userInfo,
    error,

    // Methods
    login,
    logout,
    refreshAccessToken,
    fetchUserInfo,
  };
}

export function DukeAuthProvider({ children }: { children: ReactNode }) {
  const auth = useProvideDukeAuth();
  return (
    <DukeAuthContext.Provider value={auth}>{children}</DukeAuthContext.Provider>
  );
}

export function useDukeAuth() {
  const context = useContext(DukeAuthContext);
  if (!context) {
    throw new Error("useDukeAuth must be used within a DukeAuthProvider");
  }
  return context;
}
