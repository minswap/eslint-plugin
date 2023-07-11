import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

import resultTypeHandlingRule from "../src/rules/result-type-handling";

ruleTester.run("result handling", resultTypeHandlingRule, {
  valid: [],
  invalid: [
    {
      code: ``,
      errors: [{ messageId: "resultTypeHandling" }],
    },
  ],
});
