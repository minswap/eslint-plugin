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
    `
        class Asset {
          private id: string
          constructor(id: string) {
            this.id = id
          }
          static init(id: string) {
            return new Asset(id)
          }
        }
        const a = new Asset('1')
        const b = null
        const c = a === b ? 1 : 0
    `,
    `
        class Asset {
          public id: string
          constructor(id: string) {
            this.id = id
          }
          static init(id: string) {
            return new Asset(id)
          }
        }
        function d(): Asset | number {
          if(Math.random() < 0.5) {
            return 1
          }
          return new Asset('1')
        }
        const a = d()
        const b = Asset.init('2')
        const c = a === b ? 1 : 0
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
        function k() {
          return Math.random()
        }
        class Asset {
          private id: string
          constructor(id: string) {
            this.id = id
          }
        }
        let asset: Asset | null = null
        let anotherAsset: Asset | null = null
        if(k() < 0.5) {
          asset = new Asset('1')
          anotherAsset = new Asset('2')
        }
        if(1 === 1 || asset === anotherAsset || 1 !== 2) {
          // do something
        }
        `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
        function k() {
          return Math.random()
        }
        class Asset {
          private id: string
          constructor(id: string) {
            this.id = id
          }
        }
        let asset: null | Asset
        let anotherAsset: null | Asset
        if(1 === 1 || asset === anotherAsset || 1 !== 2) {
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
          static init(id: string) {
            return new Asset(id)
          }
        }
        const a = new Asset('1')
        const b = Asset.init('2')
        const c = a === b ? 1 : 0
    `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
    {
      code: `
        class Asset {
          public id: string
          constructor(id: string) {
            this.id = id
          }
          static init(id: string) {
            return new Asset(id)
          }
        }
        const a = new Asset('1')
        const b = Asset.init('2')
        const c = a.id === b ? 1 : 0
    `,
      errors: [{ messageId: "nonPrimitivesEq" }],
    },
  ],
});
