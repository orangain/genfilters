/**
 * Apply template substitution for a directory
 */
export function applyTemplate(
  template: string,
  dirPath: string,
  dirName: string,
): string {
  if (!template.endsWith("\n")) {
    template += "\n"; // Ensure the template ends with a newline
  }
  return template
    .replaceAll(/\$(?:(\w+)|\{(\w+)\})/g, (match, bareName, enclosedName) => {
      const name = bareName ?? enclosedName;
      switch (name) {
        case "DIR":
          return dirPath.replaceAll("\\", "/"); // Normalize path separators for cross-platform consistency
        case "DIR_NAME":
          return dirName;
        default:
          return match; // Keep the original match if no replacement is found
      }
    });
}
