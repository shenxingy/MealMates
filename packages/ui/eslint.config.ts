import { defineConfig } from "eslint/config";

import { baseConfig } from "@mealmates/eslint-config/base";
import { reactConfig } from "@mealmates/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
