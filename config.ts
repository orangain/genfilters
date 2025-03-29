import { parse } from "@std/yaml";
import { z } from "npm:zod";

const configSchema = z.object({
  output: z.string(),
  directory: z.union([z.string(), z.array(z.string())]),
  "match-if-exists": z.string().optional(),
  template: z.string(),
});

const configFileSchema = z.array(configSchema);

export type FilterConfig = {
  output: string;
  directory: string[];
  "match-if-exists"?: string;
  template: string;
};

export function parseConfigFile(yamlContent: string): FilterConfig[] {
  return configFileSchema.parse(parse(yamlContent)).map((config) => {
    const directory = Array.isArray(config.directory)
      ? config.directory
      : [config.directory];
    return {
      ...config,
      directory,
    };
  });
}
