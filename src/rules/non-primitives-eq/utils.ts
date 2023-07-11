import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import ts from "typescript";

import { getParserServices } from "../utils";

export function isNonPrimitiveComparison(node: TSESTree.BinaryExpression, context: RuleContext<string, unknown[]>) {
  let isNonPrimitive = false;
  const parserServices = getParserServices(context);
  if (!parserServices) return false;
  const typeChecker = parserServices.program.getTypeChecker();

  if (node.operator === "===" || node.operator === "==" || node.operator === "!==" || node.operator === "!=") {
    const left = node.left;
    const leftType = typeChecker.getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(left));
    const right = node.right;
    const rightType = typeChecker.getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(right));
    // check if either side is an object/array
    isNonPrimitive = isNonPrimitiveType(leftType) || isNonPrimitiveType(rightType);
    if (isNonPrimitive) {
      // check if both sides are not undefined/null/never/any/unknown/union
      // bc obj !== null can be a valid comparison
      isNonPrimitive = !isSafeNonPrimitiveCheck(leftType) && !isSafeNonPrimitiveCheck(rightType);
    }
  }
  return isNonPrimitive;
}

const NON_PRIMITIVE_TYPES = [ts.TypeFlags.Object, ts.TypeFlags.Index];

const SAFE_NON_PRIMITIVE_CHECK = [
  ts.TypeFlags.Undefined,
  ts.TypeFlags.Null,
  ts.TypeFlags.Never,
  ts.TypeFlags.Any,
  ts.TypeFlags.Unknown,
  ts.TypeFlags.Union, // TODO: scope for improvement (currently we ignore if either side is a union)
];

function isNonPrimitiveType(type: ts.Type): boolean {
  return NON_PRIMITIVE_TYPES.some((flag) => type.flags === flag);
}

function isSafeNonPrimitiveCheck(type: ts.Type): boolean {
  return SAFE_NON_PRIMITIVE_CHECK.some((flag) => type.flags === flag);
}
