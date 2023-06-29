import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import type { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://typescript-eslint.io/rules/${name}`
);

const RESULT_PROPERTIES = ["ok", "err"];

const RESULT_TYPES = ["Ok", "Err"];

const RESULT_TYPE_NAME = "Result";

export default createRule({
  name: "result-type-handing",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require that function calling functions that return a Result type must handle the result",
      recommended: "warn",
    },
    schema: [],
    messages: {
      resultHandling: "All Result types must be handled.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        /**
         *
         * If the call expression returns a Ok or Err type - NO ERROR!
         *
         * see first test in test/result-handling.test.ts
         */
        const okOrErr = isOkOrErr(node);
        if (okOrErr) {
          return;
        }
        /**
         * When the call expression is unwrap - NO ERROR!
         *
         * See test2(), test3() in test/result-handling.test.ts
         *
         */
        const unWrap = isUnwrapCallExpr(node);
        if (unWrap) {
          return;
        }
        const resultType = isResultType(context, node);
        // if the call expression returns a Result type
        if (resultType) {
          /**
           * If the parent of the call expression is unwrap - NO ERROR!
           *
           * See test 2(), test3() in test/result-handling.test.ts
           */
          if (isParentUnwrapCallExpr(node)) {
            return;
          }
          /**
           * If the parent of the call expression is not unwrap, then we need to check:
           *
           * 1. If it is assigned to a variable
           * 2. If it is returned directly
           * 3. If it is not assigned to a variable
           */
          const variableName = isVariableDeclaration(getParent(node));
          /**
           * Case 1: If the result is assigned to a variable.
           */
          if (variableName) {
            // get the function body of the variable declaration
            const functionBody = findParentFunctionBody(node);
            if (functionBody) {
              const index = functionBody?.findIndex(
                (statement) => statement === node.parent?.parent
              );
              // get statements after the variable declaration
              const restStatements = functionBody.slice(index + 1);
              /**
               *
               * @variableName = the variable assigned with Result returned from the call expression
               *
               * We do following checks for statements in function body:
               *
               * 1.There is a unwrap call expression with variableName
               * 2. There is a return statement with variableName
               * 3. There is a if/ternary condition to check for variableName
               *
               * If non above conidtion is true - REPORT ERROR!
               */
              // see test4(), test5() in test/result-handling.test.ts
              const unwrap = restStatements.some((statement) =>
                doesUnwrap(statement, variableName)
              );

              const doesResultTypeCheck = restStatements.some((statement) =>
                isResultTypeCheck(statement, variableName)
              );

              // see test6() in test/result-handling.test.ts
              const doesReturn = restStatements.some(
                (statement) =>
                  statement.type === AST_NODE_TYPES.ReturnStatement &&
                  statement.argument?.type === AST_NODE_TYPES.Identifier &&
                  statement.argument.name === variableName
              );

              if (!unwrap && !doesReturn && !doesResultTypeCheck) {
                context.report({
                  node,
                  messageId: "resultHandling",
                });
              }
            }
          }
          /**
           * Case 2: If the result is returned directly - NO ERROR!
           * See test8() in test/result-handling.test.ts
           */
          const returnStatement = isReturnStatement(getParent(node));
          /**
           * Case 3: If result is not returned directly and not assigned to a variable - REPORT ERROR!
           *
           * See test9() in test/result-handling.test.ts
           */
          if (!returnStatement && !variableName) {
            context.report({
              node,
              messageId: "resultHandling",
            });
          }
        }
      },
    };
  },
});

/** Utilities */

function isResultTypeCheck(
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

function getBinaryExpression(statement: TSESTree.Statement): {
  left: TSESTree.Expression | TSESTree.PrivateIdentifier;
  right: TSESTree.Expression;
} | null {
  if (
    statement.type === AST_NODE_TYPES.IfStatement &&
    statement.test.type === AST_NODE_TYPES.BinaryExpression
  ) {
    return {
      left: statement.test.left,
      right: statement.test.right,
    };
  } else if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
    const declaration = statement.declarations[0].init;
    if (
      declaration &&
      declaration.type === AST_NODE_TYPES.ConditionalExpression &&
      declaration.test.type === AST_NODE_TYPES.BinaryExpression
    ) {
      return { left: declaration.test.left, right: declaration.test.right };
    }
  }
  return null;
}

function isMemberExpressionIdentifier(
  node: TSESTree.Node,
  name: string
): boolean {
  return (
    node.type === AST_NODE_TYPES.MemberExpression &&
    node.object.type === AST_NODE_TYPES.Identifier &&
    node.object.name === name &&
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === "type"
  );
}

function isLiteralWithResultProperty(node: TSESTree.Node): boolean {
  return (
    node.type === AST_NODE_TYPES.Literal &&
    typeof node.value === "string" &&
    RESULT_PROPERTIES.includes(node.value)
  );
}

function getParent(node: TSESTree.Node): TSESTree.Node | undefined {
  return node.parent;
}

function isReturnStatement(node: TSESTree.Node | undefined): boolean {
  if (node && node.type === AST_NODE_TYPES.ReturnStatement) {
    return true;
  }
  return false;
}

function isVariableDeclaration(
  node: TSESTree.Node | undefined
): string | false {
  if (node && node.type === AST_NODE_TYPES.VariableDeclarator) {
    const variableName = getVariableName(node);
    if (variableName) return variableName;
  }
  return false;
}

function getVariableName(node: TSESTree.Node | undefined): string | undefined {
  if (node && node.type === AST_NODE_TYPES.VariableDeclarator) {
    if (node.id.type === AST_NODE_TYPES.Identifier) {
      return node.id.name;
    }
  }
  return undefined;
}

const isOkOrErr = (node: TSESTree.CallExpression): boolean => {
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
};

function isParentUnwrapCallExpr(node: TSESTree.CallExpression): boolean {
  const parent = node.parent;
  if (parent && parent.type === AST_NODE_TYPES.CallExpression) {
    if (isUnwrapCallExpr(parent)) {
      return true;
    }
  }
  return false;
}

const isUnwrapCallExpr = (node: TSESTree.CallExpression): boolean => {
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
};

function doesUnwrap(node: TSESTree.Statement, variableName: string): boolean {
  let unwrapStatement = isUnwrapStatment(node, variableName);
  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    const declaration = node.declarations[0].init;
    if (declaration && declaration.type === AST_NODE_TYPES.CallExpression) {
      unwrapStatement = isUnwrapCallExpr(declaration);
    }
  }
  return unwrapStatement;
}

function isUnwrapStatment(
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

function isResultType(
  context: Readonly<RuleContext<"resultHandling", never[]>>,
  node: TSESTree.CallExpression
): boolean {
  const returnType = getCallExpressionReturnType(context, node);
  if (
    returnType &&
    RESULT_TYPES.some((resultType) => returnType.includes(resultType))
  ) {
    return true;
  }
  return false;
}

function getCallExpressionReturnType(
  context: Readonly<RuleContext<"resultHandling", never[]>>,
  node: TSESTree.CallExpression
): string | null {
  const parserServices = context.parserServices;
  if (!parserServices || !parserServices.program) {
    return null;
  }

  const typeChecker = parserServices.program.getTypeChecker();
  // Get the TypeScript type of the CallExpression
  const type = typeChecker.getTypeAtLocation(
    parserServices.esTreeNodeToTSNodeMap.get(node.callee)
  );

  // Get the return type of the CallExpression
  const typeSignatures = type.getCallSignatures();
  if (typeSignatures.length === 0) return null;
  const returnType = typeSignatures[0].getReturnType();

  return typeChecker.typeToString(returnType);
}

function findParentFunctionBody(
  node: TSESTree.Node
): TSESTree.Statement[] | undefined {
  let currentNode: TSESTree.Node | undefined = node.parent;
  while (currentNode) {
    // TODO: Add support for arrow functions
    if (currentNode.type === AST_NODE_TYPES.BlockStatement) {
      return currentNode.body;
    }
    currentNode = currentNode.parent;
  }
  return undefined;
}
