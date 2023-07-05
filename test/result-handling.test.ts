import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

import resultTypeHandlingRule from "../src/rules/result-type-handling";

const resultTypeDeclaration = `
  export type Ok<T> = { type: "ok"; value: T };
  export type Err<E> = { type: "err"; error: E };

  export type Result<T, E> = Ok<T> | Err<E>;

  export namespace Result {
    export const ok = <T>(value: T): Ok<T> => ({ type: "ok", value });

    export const err = <E>(error: E): Err<E> => ({ type: "err", error });

    export const unwrap = <T, E>(result: Result<T, E>): T => {
      if (result.type === "ok") {
        return result.value;
      }
      throw result.error;
    };
  }

  function getResult(foo?: number) { 
    if(foo && foo > 1) {
      return Result.err("foo must be less than 1")
    }  
    return Result.ok(1) 
  }
`;

const wrapResultDeclaration = (code: string): string => `
  ${resultTypeDeclaration}
  ${code}
`;

ruleTester.run("result handling", resultTypeHandlingRule, {
  valid: [
    resultTypeDeclaration,
    wrapResultDeclaration(`
      function test2() {
        const res = Result.unwrap(getResult(0))
        return res
      }
    `),
    wrapResultDeclaration(`
      function test3() {
        return Result.unwrap(getResult(0))
      }
    `),
    wrapResultDeclaration(`
      function test4() {
        const res = getResult(0)
        Result.unwrap(res)
        return 2
      }
    `),
    wrapResultDeclaration(`
      function test5() {
        const res = getResult(0)
        const foo = 1
        const bar = Result.unwrap(res)
        return bar
      }
    `),
    wrapResultDeclaration(`
      function test6() {
        const res = getResult()
        return res
      }
    `),
    wrapResultDeclaration(`
      function test7() {
        const res = getResult()
        if (res.type === "ok") {
          return res.value
        }
        throw new Error(res.value)
      }
    `),
    wrapResultDeclaration(`
        function test8() {
          return getResult()
        }
      `),
    wrapResultDeclaration(`
        function test10() { return 1 }
        test1()
      `),
    wrapResultDeclaration(`
      function getFakeResult() {
        return 1
      }
      function test11() {
        const res = getFakeResult()
        return res
      }
    `),
    wrapResultDeclaration(`
    function test12() {
      const res = getResult()
      const a = res.type === "err" ? res.error : res.value;
      return a
    }
  `),
  ],
  invalid: [
    {
      code: wrapResultDeclaration(`
      function test9() {
        const foo = 1
        getResult()
        return foo
      }
    `),
      errors: [{ messageId: "resultHandling" }],
    },
  ],
});
