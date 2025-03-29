import { expandGlob } from "./deps.ts";

export async function globDirectories(
  pattern: string,
): Promise<string[]> {
  const results: string[] = [];
  for await (
    const entry of expandGlob(pattern, {
      includeDirs: true,
      globstar: true,
    })
  ) {
    // Skip non-directory entries
    if (!entry.isDirectory) {
      continue;
    }

    results.push(entry.path);
  }
  return results;
}
