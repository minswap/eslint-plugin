import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { getBinaryExpression, getCallExpressionReturnType, isMemberExpressionIdentifier } from "../utils";

export const RESULT_TYPE_NAME = "Result";

const resultPropertyRegex = /^(ok|err)$/;

const resultTypeRegex = /^(Result<.*, .*>|Err<\w+>\s\|\sOk<\w+>)$/;

export function isResultTypeCheck(statement: TSESTree.Statement, variableName: string): boolean {
  // TODO: Add switch case
  const binaryExpr = getResultTypeBinaryExpr(statement);
  if (binaryExpr) {
    const { left, right } = binaryExpr;
    if (isMemberExpressionIdentifier(left, variableName) && isLiteralWithResultProperty(right)) {
      return true;
    }
  }
  return false;
}

export function getResultTypeBinaryExpr(statement: TSESTree.Statement) {
  let binaryExpr = getBinaryExpression(statement);
  if (!binaryExpr) {
    binaryExpr = getInvariantCheckBinaryExpr(statement);
  }
  return binaryExpr;
}

export function getInvariantCheckBinaryExpr(statement: TSESTree.Statement): TSESTree.BinaryExpression | null {
  if (statement.type === AST_NODE_TYPES.ExpressionStatement) {
    if (statement.expression.type === AST_NODE_TYPES.CallExpression) {
      if (statement.expression.callee.type === AST_NODE_TYPES.Identifier) {
        if (statement.expression.callee.name === "invariant") {
          if (statement.expression.arguments.length === 2) {
            const firstArg = statement.expression.arguments[0];
            if (firstArg.type === AST_NODE_TYPES.BinaryExpression) {
              return firstArg;
            }
          }
        }
      }
    }
  }
  return null;
}

export function isLiteralWithResultProperty(node: TSESTree.Node): boolean {
  return node.type === AST_NODE_TYPES.Literal && typeof node.value === "string" && resultPropertyRegex.test(node.value);
}

export function isOkOrErr(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    if (node.callee.object.type === AST_NODE_TYPES.Identifier) {
      if (node.callee.object.name === RESULT_TYPE_NAME) {
        if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
          const propertyName = node.callee.property.name;
          if (resultPropertyRegex.test(propertyName)) {
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
    if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
      if (node.callee.property.name === "unwrap") {
        return true;
      }
    }
  }
  return false;
}

export function doesUnwrap(node: TSESTree.Statement, variableName: string): boolean {
  let unwrapStatement = isUnwrapStatment(node, variableName);
  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    const declaration = node.declarations[0].init;
    if (declaration && declaration.type === AST_NODE_TYPES.CallExpression) {
      unwrapStatement = isUnwrapCallExpr(declaration);
    }
  }
  return unwrapStatement;
}

export function isUnwrapStatment(statement: TSESTree.Statement, variableName: string): boolean {
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
  node: TSESTree.CallExpression,
): boolean {
  const returnType = getCallExpressionReturnType(context, node);
  if (returnType && resultTypeRegex.test(returnType)) {
    return true;
  }
  return false;
}
