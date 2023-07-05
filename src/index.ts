import { RuleModule } from "@typescript-eslint/utils/dist/ts-eslint";

import rules from "./rules";

type Rules = {
  rules: Record<string, RuleModule<string, never[]>>;
};

export = {
  ...rules,
} as Rules;
