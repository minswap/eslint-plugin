#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Please provide a rule name with the -r or --rule option."
  exit 1
fi

here="$(cd "$(dirname "$0")" >/dev/null 2>&1 && pwd)"
root="$(cd "$here/.." && pwd)"

# Default path where the directory will be created
rule_path="$root/src/rules"

while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -r|--rule)
      rule_name="$2"
      shift
      shift
      ;;
    -d|--description)
      description="$2"
      shift
      shift
      ;;
    -m|--message)
      message="$2"
      shift
      shift
      ;;
    *)  # Ignore any other options or arguments
      shift
      ;;
  esac
done

if [ -z "$rule_name" ]; then
  echo "Please provide a rule name with the -r or --rule option."
  exit 1
fi

# hypen separated string to camel case
messageId=""
IFS="-" read -ra words <<< "$rule_name"
for ((i=0; i<${#words[@]}; i++)); do
  if [ $i -ne 0 ]; then
    messageId+="$(tr '[:lower:]' '[:upper:]' <<< ${words[$i]:0:1})${words[$i]:1}"
  else
    messageId+="${words[$i]}"
  fi
done

mkdir -p "$rule_path/$rule_name"

echo 'export { default } from "./rule";' > "$rule_path/$rule_name/index.ts"

cat <<EOF > "$rule_path/$rule_name/rule.ts"
import { RuleModule } from "@typescript-eslint/utils/dist/ts-eslint";

import { createRule } from "../utils";

export default createRule({
  name: "$rule_name",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "$description",
      recommended: "warn",
    },
    schema: [],
    messages: {
      "$messageId": "$message",
    },
  },
  defaultOptions: [],
  create(context) {
    return {};
  },
}) as RuleModule<string, never[]>;
EOF

echo "Directory '$rule_name' created at '$path'."

import_name="$messageId"Rule

# index_path="$root/src/index.ts"
# import_statement="import { import_name } from './$rule_name';"

# last_import_line=$(grep -n "^\s*import\s" "$index_path" | tail -n 1 | cut -d ":" -f 1)

# sed -i "$last_import_line"'a\'"$import_statement_to_add" "$index_path"

# echo "Import statement added to '$index_path'. Please add the rule to the rules array."

cat <<EOF > "$root/test/$rule_name.test.ts"
import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

import $import_name from "../src/rules/$rule_name";

ruleTester.run("$description", $messageId, {
  valid: [],
  invalid: [
    {
      code: \`\`,
      errors: [{ messageId: "$messageId" }],
    },
  ],
});
EOF
