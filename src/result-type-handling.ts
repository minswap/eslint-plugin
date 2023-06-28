import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://typescript-eslint.io/rules/${name}`
);

export default createRule({
  name: "result-type-handling",
  meta: {
    type: "suggestion",
    docs: {
      description: "Require that function overload signatures be consecutive",
      recommended: "error",
    },
    schema: [],
    messages: {
      resultHandling: "All Result types must be handled.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node): void {
        const returnType = getTypeOfReturnValue(node);
        if (returnType === "number") {
          context.report({
            node,
            messageId: "resultHandling",
          });
        }
      },
    };
  },
});

function getTypeOfReturnValue(node: TSESTree.CallExpression): string {
  // Check if the function call has a return statement
  if (node.parent && node.parent.type === "ReturnStatement") {
    const returnExpression = node.parent.argument;
    if (
      returnExpression?.type === "Literal" &&
      typeof returnExpression.value === "number"
    ) {
      return "number";
    }
  }

  // Default to 'unknown' if the return type cannot be determined
  return "unknown";
}
