import { parseYaml } from "./deps.ts";

// Configuration interface
export interface FilterConfig {
  output: string;
  directory: string;
  "match-if-exists"?: string;
  template: string;
}

export function parseConfigFile(yamlContent: string): FilterConfig[] {
  const parsedConfigs = parseYaml(yamlContent);

  if (!Array.isArray(parsedConfigs)) {
    throw new Error(
      "Invalid configuration format. Expected an array of configurations.",
    );
  }

  // Validate each configuration
  const configs: FilterConfig[] = [];
  for (const config of parsedConfigs) {
    if (!validateConfig(config)) {
      throw new Error(
        `Invalid configuration: ${
          JSON.stringify(
            config,
          )
        }. Each configuration must have 'output', 'directory', and 'template' properties.`,
      );
    }
    configs.push(config);
  }

  return configs;
}

/**
 * Validates a configuration object
 */
export function validateConfig(config: unknown): config is FilterConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "output" in config &&
    typeof config.output === "string" &&
    "directory" in config &&
    typeof config.directory === "string" &&
    "template" in config &&
    typeof config.template === "string"
  );
}
