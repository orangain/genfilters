import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";
import { join } from "../deps.ts";
import { applyTemplate } from "../mod.ts";
import { parseConfigFile } from "../config.ts";
import { assertThrows } from "https://deno.land/std@0.208.0/assert/assert_throws.ts";

// Test template substitution
Deno.test({
  name: "Template Substitution",
  fn() {
    const template =
      "$DIR:\n  - ${DIR}/**\n  - $DIR_NAME/workflow.yml # $DIR2\n";
    const dir = "services/api";
    const dirname = "api";

    const expected =
      "services/api:\n  - services/api/**\n  - api/workflow.yml # $DIR2\n";

    // Test the applyTemplate function from mod.ts
    const result = applyTemplate(template, dir, dirname);

    assertEquals(result, expected);
  },
});

// Test output file creation
Deno.test({
  name: "Output File Creation",
  async fn() {
    const testDir = "test/unit_output";
    const testFile = join(testDir, "test.yaml");

    try {
      // Ensure test directory exists
      ensureDirSync(testDir);

      // Test content
      const content = "test: content";

      // Write test file
      await Deno.writeTextFile(testFile, content);

      // Verify file exists and has correct content
      assertEquals(existsSync(testFile), true);
      const readContent = await Deno.readTextFile(testFile);
      assertEquals(readContent, content);
    } finally {
      // Clean up
      try {
        if (existsSync(testDir)) {
          Deno.removeSync(testDir, { recursive: true });
        }
      } catch (error) {
        console.error(`Error cleaning up ${testDir}:`, error);
      }
    }
  },
});

// Test configuration validation
Deno.test({
  name: "Configuration Validation",
  fn() {
    // Valid configuration
    const validConfig = `
- output: "output.yaml"
  directory: "**"
  template: "{dir}: test"
`;

    // Missing output
    const invalidConfig1 = `
- directory: "**"
  template: "{dir}: test"
`;

    // Missing directory
    const invalidConfig2 = `
- output: "output.yaml"
  template: "{dir}: test"
`;

    // Missing template
    const invalidConfig3 = `
- output: "output.yaml"
  directory: "**"
`;

    assertEquals(parseConfigFile(validConfig), [{
      output: "output.yaml",
      directory: ["**"],
      template: "{dir}: test",
    }]);
    assertThrows(() => parseConfigFile(invalidConfig1));
    assertThrows(() => parseConfigFile(invalidConfig2));
    assertThrows(() => parseConfigFile(invalidConfig3));
  },
});
