import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import { 
  exchangeCodeAsync, 
  refreshAsync, 
  revokeAsync,
  ResponseType 
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { DUKE_AUTH_CONFIG, DukeUserInfo, TokenResponse } from "../config/dukeAuth";

const TOKEN_KEY = "duke_access_token";
const REFRESH_TOKEN_KEY = "duke_refresh_token";
const TOKEN_EXPIRY_KEY = "duke_token_expiry";

export function useDukeAuth() {
  const [isLoading, setIsLoading] = useState(false);
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

  // Set up the auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: DUKE_AUTH_CONFIG.clientId,
      clientSecret: DUKE_AUTH_CONFIG.clientSecret,
      scopes: DUKE_AUTH_CONFIG.scopes,
      redirectUri: DUKE_AUTH_CONFIG.redirectUri,
      usePKCE: false,
    },
    discovery
  );

  // Handle the OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response?.type === "error") {
      setError(response.error?.message || "Authentication failed");
      setIsLoading(false);
    }
  }, [response]);

  // Load stored tokens on mount
  useEffect(() => {
    loadStoredTokens();
  }, []);

  // Load tokens from secure storage
  const loadStoredTokens = async () => {
    try {
      const storedAccessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const storedExpiry = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);

      if (storedAccessToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const currentTime = Date.now();

        // Check if token is expired
        if (currentTime < expiryTime) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          // Fetch user info with stored token
          await fetchUserInfo(storedAccessToken);
        } else if (storedRefreshToken) {
          // Token expired, try to refresh
          await refreshAccessToken(storedRefreshToken);
        }
      }
    } catch (err) {
      console.error("Error loading stored tokens:", err);
    }
  };

  // Store tokens securely
  const storeTokens = async (
    access: string,
    refresh?: string,
    expiresIn?: number
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
          redirectUri: DUKE_AUTH_CONFIG.redirectUri,
        },
        discovery
      );

      if (tokenResponse.accessToken) {
        setAccessToken(tokenResponse.accessToken);
        setRefreshToken(tokenResponse.refreshToken);
        
        await storeTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
          tokenResponse.expiresIn
        );

        // Fetch user information
        await fetchUserInfo(tokenResponse.accessToken);
      }
    } catch (err: any) {
      console.error("Error exchanging code for token:", err);
      setError(err.message || "Failed to exchange authorization code");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user information from Duke
  const fetchUserInfo = async (token?: string): Promise<DukeUserInfo | null> => {
    const tokenToUse = token || accessToken;
    
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

      const data: DukeUserInfo = await response.json();
      setUserInfo(data);
      return data;
    } catch (err: any) {
      console.error("Error fetching user info:", err);
      setError(err.message || "Failed to fetch user information");
      return null;
    }
  };

  // Refresh the access token
  const refreshAccessToken = async (token?: string) => {
    const tokenToUse = token || refreshToken;
    
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
        { tokenEndpoint: DUKE_AUTH_CONFIG.tokenEndpoint }
      );

      if (tokenResponse.accessToken) {
        setAccessToken(tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
          setRefreshToken(tokenResponse.refreshToken);
        }
        
        await storeTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
          tokenResponse.expiresIn
        );

        await fetchUserInfo(tokenResponse.accessToken);
      }
    } catch (err: any) {
      console.error("Error refreshing token:", err);
      setError(err.message || "Failed to refresh access token");
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
    } catch (err: any) {
      console.error("Error initiating login:", err);
      setError(err.message || "Failed to initiate login");
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
            { revocationEndpoint: DUKE_AUTH_CONFIG.revocationEndpoint }
          );
        } catch (err) {
          console.error("Error revoking token:", err);
          // Continue with logout even if revocation fails
        }
      }

      // Clear tokens from state
      setAccessToken(null);
      setRefreshToken(null);
      setUserInfo(null);

      // Clear tokens from secure storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
    } catch (err: any) {
      console.error("Error during logout:", err);
      setError(err.message || "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
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

