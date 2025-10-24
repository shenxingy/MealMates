import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@mealmates/eslint-config/base";
import { nextjsConfig } from "@mealmates/eslint-config/nextjs";
import { reactConfig } from "@mealmates/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
