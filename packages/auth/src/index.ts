import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@mealmates/db/client";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  discordClientId: string;
  discordClientSecret: string;
  dukeClientId: string;
  dukeClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
    ],
    socialProviders: {
      discord: {
        clientId: options.discordClientId,
        clientSecret: options.discordClientSecret,
        redirectURI: `${options.baseUrl}/api/auth/callback/discord`,
      },
      // @ts-expect-error - Custom OIDC provider for Duke
      duke: {
        clientId: options.dukeClientId,
        clientSecret: options.dukeClientSecret,
        discoveryUrl:
          "https://oauth.oit.duke.edu/oidc/.well-known/openid-configuration",
        redirectURI: `${options.baseUrl}/api/auth/callback/duke`,
        scopes: ["openid", "email", "profile", "offline_access"],
        pkce: true,
        tokenEndpointAuthMethod: "client_secret_basic",
      },
    },
    trustedOrigins: ["expo://", "mealmates://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
