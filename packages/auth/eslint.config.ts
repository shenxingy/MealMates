import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@mealmates/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
);
