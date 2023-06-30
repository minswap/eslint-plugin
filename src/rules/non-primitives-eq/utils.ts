import { TSESTree } from "@typescript-eslint/utils";

export function isNonPrimitiveComparison(node: TSESTree.Node) {
  return (
    node.type === "BinaryExpression" &&
    node.operator === "===" &&
    (isObjectType(node.left) || isObjectType(node.right))
  );
}

export function isObjectType(node: TSESTree.Node) {
  return node.type === "ArrayExpression" || node.type === "ObjectExpression";
}
