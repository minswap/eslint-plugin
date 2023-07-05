import { RuleModule } from "@typescript-eslint/utils/dist/ts-eslint";

import { createRule } from "../utils";
import { isNonPrimitiveComparison } from "./utils";

export default createRule({
  name: "non-primitives-eq",
  meta: {
    type: "suggestion",
    docs: {
      description: "Prevents non-primitives from being compared with the equality/deep equality operator",
      recommended: "warn",
    },
    schema: [],
    messages: {
      nonPrimitivesEq: "Avoid === comparison with objects and arrays. Only allow comparison for primitive types.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        const test = node.test;
        if (isNonPrimitiveComparison(test)) {
          context.report({
            node: test,
            messageId: "nonPrimitivesEq",
          });
        }
      },
      ConditionalExpression(node) {
        const test = node.test;
        if (isNonPrimitiveComparison(test)) {
          context.report({
            node: test,
            messageId: "nonPrimitivesEq",
          });
        }
      },
    };
  },
}) as RuleModule<string, never[]>;
