import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

import nonPrimitiveEqRule from "../src/rules/non-primitives-eq";

ruleTester.run("non primitives equality", nonPrimitiveEqRule, {
  valid: [
    `
        const a = 1
        const b = 1
        if(a === b) {
            // do something
        }
      `,
    `
        const a = 'a'
        const b = 'b'
        if(a === b) {
            // do something
        }
      `,
    `
        const a = 1
        const b = 1
        const c = a === b ? 1 : 0
    `,
    `
        const a = 1
        const b = 1
        const c = a == b ? 1 : 0
    `,
  ],
  invalid: [
    {
      code: `
        const a = {}
        const b = {}
        if(a === b) {
            // do something
        }
      `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
          const a = []
          const b = []
          if(a === b) {
            // do something
          }
        `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
            const a = []
            const b = []
            if(a == b) {
                // do something
            }
          `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
            const a = []
            const b = []
            const c = a === b ? 1 : 0
          `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
              const a = 1
              const b = []
              const c = a === b ? 1 : 0
            `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
                const a = 1
                const b = []
                const c = a == b ? 1 : 0
              `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
        class Asset {
          private id: string
          constructor(id: string) {
            this.id = id
          }
        }
        const asset = new Asset('1')
        const anotherAsset = new Asset('2')
        if(asset === anotherAsset) {
          // do something
        }
        `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
        class Asset {
          private id: string
          constructor(id: string) {
            this.id = id
          }
        }
        const asset = new Asset('1')
        const anotherAsset = new Asset('2')
        if(1 === 1 || asset === anotherAsset || 1 !== 2) {
          // do something
        }
        `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
  ],
});
