import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";
import { join } from "../deps.ts";

// Mock FilterConfig interface
interface FilterConfig {
  output: string;
  directory: string;
  "match-if-exists"?: string;
  template: string;
}

// Test template substitution
Deno.test({
  name: "Template Substitution",
  fn() {
    const template = "{dir}:\n  - {dir}/**\n  - {dirname}/workflow.yml";
    const dir = "services/api";
    const dirname = "api";

    const expected = "services/api:\n  - services/api/**\n  - api/workflow.yml";

    let result = template;
    result = result.replace(/\{dir\}/g, dir);
    result = result.replace(/\{dirname\}/g, dirname);

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
    const validConfig: FilterConfig = {
      output: "output.yaml",
      directory: "**",
      template: "{dir}: test",
    };

    // Missing output
    const invalidConfig1 = {
      directory: "**",
      template: "{dir}: test",
    };

    // Missing directory
    const invalidConfig2 = {
      output: "output.yaml",
      template: "{dir}: test",
    };

    // Missing template
    const invalidConfig3 = {
      output: "output.yaml",
      directory: "**",
    };

    // Function to validate config
    function validateConfig(config: any): config is FilterConfig {
      return (
        typeof config === "object" &&
        config !== null &&
        typeof config.output === "string" &&
        typeof config.directory === "string" &&
        typeof config.template === "string"
      );
    }

    assertEquals(validateConfig(validConfig), true);
    assertEquals(validateConfig(invalidConfig1), false);
    assertEquals(validateConfig(invalidConfig2), false);
    assertEquals(validateConfig(invalidConfig3), false);
  },
});
