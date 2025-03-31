#!/usr/bin/env -S deno run --allow-read --allow-write
import { basename, dirname, join, relative } from "jsr:@std/path@^1.0.8";
import { ensureDirSync, existsSync } from "jsr:@std/fs@^1.0.15";
import { FilterConfig, parseConfigFile } from "./config.ts";
import { globDirectories } from "./glob.ts";
import { applyTemplate } from "./template.ts";

// Default config file name
const DEFAULT_CONFIG_FILE = "genfilters.yaml";

/**
 * Main function
 */
async function main() {
  try {
    // Get config file path from command line args or use default
    const configPath = Deno.args.length > 0
      ? Deno.args[0]
      : DEFAULT_CONFIG_FILE;

    console.log(`Using config file: ${configPath}`);

    // Read and parse the YAML config file
    const yamlContent = await Deno.readTextFile(configPath);
    const configs = parseConfigFile(yamlContent);

    // Process each configuration
    for (const config of configs) {
      await processConfig(config);
    }
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "An error occurred";
    console.error(`Error: ${message}`);
    Deno.exit(1);
  }
}

/**
 * Processes a single configuration entry
 */
async function processConfig(config: FilterConfig): Promise<void> {
  // Create an array to store the processed template results
  const results: string[] = [];

  // Find all directories matching the pattern
  const directories = await globDirectories(config.directory);
  for (
    const directory of directories
  ) {
    const result = processDirectory(directory, config);
    if (result) {
      results.push(result);
    }
  }

  // If we have results, write them to the output file
  if (results.length > 0) {
    const outputContent =
      "# This file is auto-generated by genfilters. Do not edit manually.\n" +
      results.join("");

    // Ensure the output directory exists
    ensureDirSync(dirname(config.output));

    // Write the output file
    await Deno.writeTextFile(config.output, outputContent);

    console.log(`Generated ${config.output} with ${results.length} entries`);
  } else {
    console.log(
      `No matching directories found for pattern: ${config.directory}`,
    );
  }
}

/**
 * Process a single directory for a given configuration
 */
function processDirectory(
  dirPath: string,
  config: FilterConfig,
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
  return applyTemplate(config.template, dirRelativePath, dirName);
}

// Run the main function
if (import.meta.main) {
  main();
}
