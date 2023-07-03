import resultTypeHandlingRule from "./result-type-handling";
import nonPrimitiveEqRule from "./non-primitives-eq";

export default {
  rules: {
    "result-type-handling": resultTypeHandlingRule,
    "non-primitives-eq": nonPrimitiveEqRule,
  },
};
