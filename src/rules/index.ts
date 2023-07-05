import nonPrimitiveEqRule from "./non-primitives-eq";
import resultTypeHandlingRule from "./result-type-handling";

export default {
  rules: {
    "result-type-handling": resultTypeHandlingRule,
    "non-primitives-eq": nonPrimitiveEqRule,
  },
};
