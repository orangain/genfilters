import { assertEquals, assertExists } from "jsr:@std/assert@^1.0.12";
import { join } from "jsr:@std/path@^1.0.8";
import { ensureDirSync, existsSync } from "jsr:@std/fs@^1.0.15";

// Helper function to run the command
async function runCommand(configPath: string): Promise<string> {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      join(Deno.cwd(), "mod.ts"),
      configPath,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr } = await command.output();
  const output = new TextDecoder().decode(stdout);
  const error = new TextDecoder().decode(stderr);

  if (error) {
    console.error(error);
  }

  return output;
}

// Helper function to clean up test output files
function cleanupOutputFiles() {
  for (const file of Object.keys(expectedContents)) {
    try {
      if (existsSync(file)) {
        Deno.removeSync(file);
      }
    } catch (error) {
      console.error(`Error cleaning up ${file}:`, error);
    }
  }

  try {
    if (existsSync("test/output")) {
      Deno.removeSync("test/output", { recursive: true });
    }
  } catch (error) {
    console.error("Error cleaning up test/output directory:", error);
  }
}

const expectedContents = {
  "test/output/match-if-exists.yaml":
    `# This file is auto-generated by genfilters. Do not edit manually.
test/fixtures:
  - test/fixtures/**
test/fixtures/services/api:
  - test/fixtures/services/api/**
test/fixtures/tools:
  - test/fixtures/tools/**
`,
  "test/output/dirname.yaml":
    `# This file is auto-generated by genfilters. Do not edit manually.
api:
  - test/fixtures/services/api/**
web:
  - test/fixtures/services/web/**
`,
  "test/output/multi-directories.yaml":
    `# This file is auto-generated by genfilters. Do not edit manually.
test/fixtures/services/api:
  - test/fixtures/services/api/**
test/fixtures/services/web:
  - test/fixtures/services/web/**
test/fixtures/tools:
  - test/fixtures/tools/**
`,
};

// Create test suite
Deno.test({
  name: "GenFilters - Integration Test",
  async fn() {
    try {
      // Ensure output directory exists
      ensureDirSync("test/output");

      // Run the command with test configuration
      await runCommand("test/fixtures/genfilters.yaml");

      for (
        const [filePath, expectedContent] of Object.entries(expectedContents)
      ) {
        // Verify output files exist
        assertExists(
          Deno.statSync(filePath),
          `${filePath} should be created`,
        );
        const fileContent = Deno.readTextFileSync(filePath);
        assertEquals(
          fileContent,
          expectedContent,
          `${filePath} content should match expected content`,
        );
      }
    } finally {
      // Clean up test output files
      cleanupOutputFiles();
    }
  },
});

// Create test suite for error handling
Deno.test({
  name: "GenFilters - Error Handling",
  async fn() {
    try {
      // Run the command with non-existent configuration file
      await runCommand("non-existent-config.yaml");

      for (
        const filePath of Object.keys(expectedContents)
      ) {
        // Verify output files do not exist
        assertEquals(
          existsSync(filePath),
          false,
          `${filePath} should not be created when config file doesn't exist`,
        );
      }
    } finally {
      // Clean up test output files
      cleanupOutputFiles();
    }
  },
});
