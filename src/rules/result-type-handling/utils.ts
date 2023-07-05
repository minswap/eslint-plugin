import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  getBinaryExpression,
  getCallExpressionReturnType,
  isMemberExpressionIdentifier,
} from "../utils";

export const RESULT_PROPERTIES = ["ok", "err"];

export const RESULT_TYPES = ["Ok", "Err"];

export const RESULT_TYPE_NAME = "Result";

export function isResultTypeCheck(
  statement: TSESTree.Statement,
  variableName: string
): boolean {
  // TODO: Add switch case
  const binaryExpr = getBinaryExpression(statement);
  if (binaryExpr) {
    const { left, right } = binaryExpr;
    if (
      isMemberExpressionIdentifier(left, variableName) &&
      isLiteralWithResultProperty(right)
    ) {
      return true;
    }
  }
  return false;
}

export function isLiteralWithResultProperty(node: TSESTree.Node): boolean {
  return (
    node.type === AST_NODE_TYPES.Literal &&
    typeof node.value === "string" &&
    RESULT_PROPERTIES.includes(node.value)
  );
}

export function isOkOrErr(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    if (node.callee.object.type === AST_NODE_TYPES.Identifier) {
      if (node.callee.object.name === RESULT_TYPE_NAME) {
        if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
          const propertyName = node.callee.property.name;
          if (
            RESULT_PROPERTIES.some((resultType) => propertyName === resultType)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function isParentUnwrapCallExpr(node: TSESTree.CallExpression): boolean {
  const parent = node.parent;
  if (parent && parent.type === AST_NODE_TYPES.CallExpression) {
    if (isUnwrapCallExpr(parent)) {
      return true;
    }
  }
  return false;
}

export function isUnwrapCallExpr(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    if (node.callee.object.type === AST_NODE_TYPES.Identifier) {
      if (node.callee.object.name === RESULT_TYPE_NAME) {
        if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
          const propertyName = node.callee.property.name;
          if (propertyName === "unwrap") {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function doesUnwrap(
  node: TSESTree.Statement,
  variableName: string
): boolean {
  let unwrapStatement = isUnwrapStatment(node, variableName);
  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    const declaration = node.declarations[0].init;
    if (declaration && declaration.type === AST_NODE_TYPES.CallExpression) {
      unwrapStatement = isUnwrapCallExpr(declaration);
    }
  }
  return unwrapStatement;
}

export function isUnwrapStatment(
  statement: TSESTree.Statement,
  variableName: string
): boolean {
  return (
    statement.type === AST_NODE_TYPES.ExpressionStatement &&
    statement.expression.type === AST_NODE_TYPES.CallExpression &&
    statement.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    statement.expression.callee.object.type === AST_NODE_TYPES.Identifier &&
    statement.expression.callee.object.name === RESULT_TYPE_NAME &&
    statement.expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    statement.expression.callee.property.name === "unwrap" &&
    statement.expression.arguments.length === 1 &&
    statement.expression.arguments[0].type === AST_NODE_TYPES.Identifier &&
    statement.expression.arguments[0].name === variableName
  );
}

export function isResultType(
  context: Readonly<RuleContext<"resultHandling", never[]>>,
  node: TSESTree.CallExpression
): boolean {
  const parserServices = context.parserServices;
  if (!parserServices || !parserServices.program) {
    return false;
  }
  const returnType = getCallExpressionReturnType(parserServices, node);
  if (
    returnType &&
    RESULT_TYPES.some((resultType) => returnType.includes(resultType))
  ) {
    return true;
  }
  return false;
}
