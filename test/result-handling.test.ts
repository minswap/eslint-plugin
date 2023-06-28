import * as parser from "@typescript-eslint/parser";
import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

import rule from "../src/result-type-handling";

ruleTester.run("result handling", rule, {
  valid: [],
  invalid: [
    {
      code: `
      const test = (): void => {
        const a = test2();
        console.info(a);
      };
      
      const test2 = (): number => 2;
      `,
      errors: [{ messageId: "resultHandling" }],
    },
  ],
});
