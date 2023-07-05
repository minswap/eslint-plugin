# Minswap Eslint Plugin

Contains rules used by our TypeScript repositories.

## Create a new rule

Use script `scripts/initRule.sh`. It automates the process of creating the necessary directory structure, files, and import statement in the index file. Follow the steps below to run the script:

### Usage

Give script executable permissions

```
chmod +x scripts/initRule.sh
```

Run the script with the following command:

```
./scripts/initRule.sh -r <rule_name> [-d <description>] [-m <message>]
```

Replace <rule_name> with the desired name for your new rule. Optionally, you can provide a description and a message for the rule using the -d and -m options, respectively.

Example

```
./scripts/initRule.sh -r my-custom-rule -d "Enforce a specific coding style" -m "Avoid using unnecessary variables"
```

## Testing

Use script `scripts/pack.sh`. It automates the process of bumping npm package version to a random version, build, pack and revert version update.

### Usage

1. Give script executable permissions

   ```
   chmod +x scripts/pack.sh
   ```

2. Run the script with the following command:

   ```
   ./scripts/pack.sh
   ```

3. Find `*.tgz` file in the root folder and copy its full path.

4. Install this package:

   ```
   npm i -D <path>/minswap-eslint-plugin-1.0.4913.tgz
   ```

The scripts always randomizes the patch version with 4 digit random number. Copy the 4 digit number and paste in package.json to path where this plugin was installed for testing for easy updates.
