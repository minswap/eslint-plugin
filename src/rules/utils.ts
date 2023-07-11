import { AST_NODE_TYPES, ESLintUtils, ParserServices, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

// fake url for now
export const createRule = ESLintUtils.RuleCreator((name) => `https://eslint.minswap.org/rules/${name}`);

export function getBinaryExpression(statement: TSESTree.Statement): {
  left: TSESTree.Expression | TSESTree.PrivateIdentifier;
  right: TSESTree.Expression;
} | null {
  if (statement.type === AST_NODE_TYPES.IfStatement && statement.test.type === AST_NODE_TYPES.BinaryExpression) {
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

export function isMemberExpressionIdentifier(node: TSESTree.Node, name: string): boolean {
  return (
    node.type === AST_NODE_TYPES.MemberExpression &&
    node.object.type === AST_NODE_TYPES.Identifier &&
    node.object.name === name &&
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === "type"
  );
}

export function getParent(node: TSESTree.Node): TSESTree.Node | undefined {
  return node.parent;
}

export function isReturnStatement(node: TSESTree.Node | undefined): boolean {
  if (node && node.type === AST_NODE_TYPES.ReturnStatement) {
    return true;
  }
  return false;
}

export function isVariableDeclaration(node: TSESTree.Node | undefined): string | false {
  if (node && node.type === AST_NODE_TYPES.VariableDeclarator) {
    const variableName = getVariableName(node);
    if (variableName) return variableName;
  }
  return false;
}

export function getVariableName(node: TSESTree.Node | undefined): string | undefined {
  if (node && node.type === AST_NODE_TYPES.VariableDeclarator) {
    if (node.id.type === AST_NODE_TYPES.Identifier) {
      return node.id.name;
    }
  }
  return undefined;
}

export function findParentFunctionBody(node: TSESTree.Node): TSESTree.Statement[] | undefined {
  let currentNode: TSESTree.Node | undefined = node.parent;
  while (currentNode) {
    // TODO: Add support for arrow functions
    if (currentNode.type === AST_NODE_TYPES.BlockStatement || currentNode.type === AST_NODE_TYPES.Program) {
      return currentNode.body;
    }
    currentNode = currentNode.parent;
  }
  return undefined;
}

export function getCallExpressionReturnType(
  context: RuleContext<string, unknown[]>,
  node: TSESTree.CallExpression,
): string | null {
  const parserServices = getParserServices(context);
  if (!parserServices) return null;
  const typeChecker = parserServices.program.getTypeChecker();

  // Get the TypeScript type of the CallExpression
  const type = typeChecker.getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(node.callee));

  // Get the return type of the CallExpression
  const typeSignatures = type.getCallSignatures();
  if (typeSignatures.length === 0) return null;
  const returnType = typeSignatures[0].getReturnType();

  return typeChecker.typeToString(returnType);
}

export function getVariableDeclaration(
  functionBody: TSESTree.Statement[],
  variableName: string,
): TSESTree.VariableDeclarator | undefined {
  for (const statement of functionBody) {
    if (statement.type === TSESTree.AST_NODE_TYPES.VariableDeclaration && statement.declarations.length > 0) {
      const declaration = statement.declarations[0];
      if (declaration.type === AST_NODE_TYPES.VariableDeclarator) {
        if (declaration.id.type === AST_NODE_TYPES.Identifier) {
          if (declaration.id.name === variableName) {
            return declaration;
          }
        }
      }
    }
  }
  return undefined;
}

export function getParserServices(context: RuleContext<string, unknown[]>): ParserServices | null {
  const parserServices = context.parserServices;
  if (!parserServices || !parserServices.program) {
    return null;
  }
  return parserServices;
}
