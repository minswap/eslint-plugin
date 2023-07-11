#!/bin/bash

here="$(cd "$(dirname "$0")" >/dev/null 2>&1 && pwd)"
root="$(cd "$here/.." && pwd)"
path="$root/package.json"

# Store the current version
original_version=$(jq -r '.version' $path)

# Generate a random version number
random_number=$((RANDOM % 9000 + 1000))
random_version="1.0.$random_number"

# Update the version in package.json
jq --arg new_version "$random_version" '.version = $new_version' $path > $path.tmp
mv $path.tmp $path

# Run npm build
npm run build

# Run npm pack
npm pack

# Revert the version back to the original value
jq --arg original_version "$original_version" '.version = $original_version' $path > $path.tmp
mv $path.tmp $path

# Output success message
echo "Version changed to $random_version, build and pack completed, version reverted to $original_version."
