#!/usr/bin/env -S deno run --allow-read --allow-write
import {
  parseYaml,
  expandGlob,
  basename,
  join,
  relative,
  dirname,
  ensureFileSync,
  ensureDirSync,
  existsSync,
} from "./deps.ts";

// Configuration interface
interface FilterConfig {
  output: string;
  directory: string;
  "match-if-exists"?: string;
  template: string;
}

// Default config file name
const DEFAULT_CONFIG_FILE = "genfilters.yaml";

/**
 * Main function
 */
async function main() {
  try {
    // Get config file path from command line args or use default
    const configPath =
      Deno.args.length > 0 ? Deno.args[0] : DEFAULT_CONFIG_FILE;

    console.log(`Using config file: ${configPath}`);

    // Read and parse the YAML config file
    const yamlContent = await Deno.readTextFile(configPath);
    const configs = parseYaml(yamlContent) as FilterConfig[];

    if (!Array.isArray(configs)) {
      throw new Error(
        "Invalid configuration format. Expected an array of configurations."
      );
    }

    console.log(`Found ${configs.length} configurations to process`);

    // Process each configuration
    for (const config of configs) {
      await processConfig(config);
    }

    console.log("All configurations processed successfully");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  }
}

/**
 * Processes a single configuration entry
 */
async function processConfig(config: FilterConfig): Promise<void> {
  console.log(`Processing config for output: ${config.output}`);

  // Create an array to store the processed template results
  const results: string[] = [];

  // Find all directories matching the pattern
  for await (const entry of expandGlob(config.directory, {
    includeDirs: true,
    globstar: true,
  })) {
    // Skip non-directory entries
    if (!entry.isDirectory) {
      continue;
    }
    const result = processDirectory(entry.path, config);
    if (result) {
      results.push(result);
    }
  }

  // If we have results, write them to the output file
  if (results.length > 0) {
    const outputContent = results.join("\n");

    // Ensure the output directory exists
    ensureDirSync(dirname(config.output));

    // Write the output file
    ensureFileSync(config.output);
    await Deno.writeTextFile(config.output, outputContent);

    console.log(`Generated ${config.output} with ${results.length} entries`);
  } else {
    console.log(
      `No matching directories found for pattern: ${config.directory}`
    );
  }
}

/**
 * Process a single directory for a given configuration
 */
function processDirectory(
  dirPath: string,
  config: FilterConfig
): string | null {
  const dirRelativePath = relative(Deno.cwd(), dirPath);

  // Check if match-if-exists file exists if specified
  if (config["match-if-exists"]) {
    const filePath = join(dirPath, config["match-if-exists"]);
    if (!existsSync(filePath)) {
      return null;
    }
  }

  // Get the directory name (basename)
  const dirName = basename(dirPath);

  // Apply template
  let result = config.template;
  result = result.replace(/\{dir\}/g, dirRelativePath);
  result = result.replace(/\{dirname\}/g, dirName);

  return result;
}

// Run the main function
if (import.meta.main) {
  main();
}
