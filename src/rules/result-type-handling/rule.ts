import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import {
  createRule,
  findParentFunctionBody,
  getParent,
  isReturnStatement,
  isVariableDeclaration,
} from "../utils";
import {
  doesUnwrap,
  isOkOrErr,
  isParentUnwrapCallExpr,
  isResultType,
  isResultTypeCheck,
  isUnwrapCallExpr,
} from "./utils";

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
