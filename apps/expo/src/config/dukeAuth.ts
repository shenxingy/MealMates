/**
 * Duke OAuth Configuration
 * 
 * This file contains the configuration for Duke's OAuth authentication
 */

export const DUKE_AUTH_CONFIG = {
  // Duke OAuth endpoints
  authorizationEndpoint: "https://oauth.oit.duke.edu/oidc/authorize",
  tokenEndpoint: "https://oauth.oit.duke.edu/oidc/token",
  revocationEndpoint: "https://oauth.oit.duke.edu/oidc/revoke",
  userInfoEndpoint: "https://oauth.oit.duke.edu/oidc/userinfo",
  
  // Client credentials
  clientId: "MealMates",
  clientSecret: "N0yVzrEOrNNdFHVQoNrCewHZX8hHCxqkzUI4bZnty9_Tteecxnp_sKS06d0AXXTBU152k7bRis8x4d7Kq8PEZQ",
  
  // Scopes
  scopes: ["openid", "email", "profile", "offline_access"],
  
  // Redirect URI (must match the scheme in app.config.ts)
  redirectUri: "mealmates://auth/callback",
};

export interface DukeUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  dukeNetID?: string;
  dukeUniqueID?: string;
  dukePrimaryAffiliation?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
}

