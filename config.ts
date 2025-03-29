import { parseYaml } from "./deps.ts";
import { z } from "./deps.ts";

const configSchema = z.object({
  output: z.string(),
  directory: z.string(),
  "match-if-exists": z.string().optional(),
  template: z.string(),
});

const configFileSchema = z.array(configSchema);

export type FilterConfig = z.infer<typeof configSchema>;

export function parseConfigFile(yamlContent: string): FilterConfig[] {
  const parsedConfigs = parseYaml(yamlContent);
  const configs = configFileSchema.parse(parsedConfigs);
  return configs;
}
