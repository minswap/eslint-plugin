# Minswap Eslint Plugin

Contains rules used by our TypeScript repositories.

## Create a new rule

Use script `scripts/initRule.sh`. It automates the process of creating the necessary directory structure, files, and import statement in the index file. Follow the steps below to run the script:

### Prerequisites

1. Make sure you have Bash installed on your system.

2. Make sure the script file has executable permissions (chmod +x create-rule.sh) before running it.

### Usage

Run the script with the following command:

```
./create-rule.sh -r <rule_name> [-d <description>] [-m <message>]
```

Replace <rule_name> with the desired name for your new rule. Optionally, you can provide a description and a message for the rule using the -d and -m options, respectively.

Example

```
./create-rule.sh -r my-custom-rule -d "Enforce a specific coding style" -m "Avoid using unnecessary variables"
```

## Testing

Use script `scripts/pack.sh`. It automates the process of bumping npm package version to a random version, build, pack and revert version update.

### Prerequisites

1. Make sure you have Bash installed on your system.

2. Make sure the script file has executable permissions (chmod +x create-rule.sh) before running it.

### Usage

1. Run the script with the following command:

   ```
   ./pack.sh
   ```

2. Find `*.tgz` file in the root folder and copy its full path.

3. Install this package:

   ```
       npm i <path>/minswap-eslint-plugin-1.0.4913.tgz
   ```

The scripts always randomizes the patch version with 4 digit random number. Copy the 4 digit number and paste in package.json to path where this plugin was installed for testing for easy updates.
