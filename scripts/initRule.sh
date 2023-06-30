#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Please provide a rule name with the -r or --rule option."
  exit 1
fi

# Default path where the directory will be created
path="../src/rules"

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

echo $rule_name
echo $description
echo $result

# Create the directory
mkdir -p "$path/$rule_name"

# Create index.ts file with content
echo 'export { default } from "./rule";' > "$path/$rule_name/index.ts"


cat <<EOF > "$path/$rule_name/rule.ts"
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
      resultHandling: "$message",
    },
  },
  defaultOptions: [],
  create(context) {
    return {};
  },
});
EOF

echo "Directory '$rule_name' created at '$path'."
