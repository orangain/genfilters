import { expandGlob } from "jsr:@std/fs@^1.0.15";

export async function globDirectories(
  patterns: string[],
): Promise<string[]> {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const pattern of patterns) {
    for await (
      const entry of expandGlob(pattern, {
        includeDirs: true,
        globstar: true,
      })
    ) {
      if (!entry.isDirectory) {
        continue;
      }
      if (seen.has(entry.path)) {
        continue;
      }
      seen.add(entry.path);
      results.push(entry.path);
    }
  }

  return results.toSorted();
}
