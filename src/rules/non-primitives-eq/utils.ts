import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { findParentFunctionBody, getVariableDeclaration } from "../utils";

export function isNonPrimitiveComparison(node: TSESTree.BinaryExpression) {
  let isNonPrimitive = false;
  if (node.operator === "===" || node.operator === "==") {
    const left = node.left;
    const functionBody = findParentFunctionBody(node);
    if (functionBody) {
      if (left.type === "Identifier") {
        const variableDeclaration = getVariableDeclaration(
          functionBody,
          left.name
        );
        isNonPrimitive = isNonPrimitiveType(variableDeclaration);
      }
      if (!isNonPrimitive) {
        const right = node.right;
        if (right.type === "Identifier") {
          const variableDeclaration = getVariableDeclaration(
            functionBody,
            right.name
          );
          isNonPrimitive = isNonPrimitiveType(variableDeclaration);
        }
      }
    }
  }
  return isNonPrimitive;
}

export function isNonPrimitiveType(
  declaration: TSESTree.VariableDeclarator | undefined
): boolean {
  if (declaration) {
    if (declaration.init) {
      const type = declaration.init.type;
      return (
        type === AST_NODE_TYPES.ArrayExpression ||
        type === AST_NODE_TYPES.ObjectExpression ||
        type === AST_NODE_TYPES.NewExpression
      );
    }
  }
  return false;
}
