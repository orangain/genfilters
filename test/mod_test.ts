import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { dirname, join } from "../deps.ts";
import { ensureDirSync } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";

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
  const outputFiles = [
    "test/output/test_kotlin.yaml",
    "test/output/deploy.yaml",
  ];

  for (const file of outputFiles) {
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

// Create test suite
Deno.test({
  name: "GenFilters - Integration Test",
  async fn() {
    try {
      // Ensure output directory exists
      ensureDirSync("test/output");

      // Run the command with test configuration
      const output = await runCommand("test/fixtures/genfilters.yaml");

      // Check command output
      console.log(output);

      // Verify output files exist
      assertExists(
        Deno.statSync("test/output/test_kotlin.yaml"),
        "test_kotlin.yaml should be created"
      );
      assertExists(
        Deno.statSync("test/output/deploy.yaml"),
        "deploy.yaml should be created"
      );

      // Read content of test_kotlin.yaml
      const testKotlinContent = Deno.readTextFileSync(
        "test/output/test_kotlin.yaml"
      );
      console.log("Actual test_kotlin.yaml content:");
      console.log(testKotlinContent);

      // Define expected content for test_kotlin.yaml
      const expectedTestKotlinContent = `test/fixtures:
  - test/fixtures/**
  - .github/workflows/test_kotlin.yml

test/fixtures/services/api:
  - test/fixtures/services/api/**
  - .github/workflows/test_kotlin.yml

test/fixtures/tools:
  - test/fixtures/tools/**
  - .github/workflows/test_kotlin.yml
`;

      // Compare the entire file content
      assertEquals(
        testKotlinContent,
        expectedTestKotlinContent,
        "test_kotlin.yaml content should match expected content"
      );

      // Read content of deploy.yaml
      const deployContent = Deno.readTextFileSync("test/output/deploy.yaml");
      console.log("Actual deploy.yaml content:");
      console.log(deployContent);

      // Define expected content for deploy.yaml
      const expectedDeployContent = `api:
  - test/fixtures/services/api/**
  - .github/workflows/deploy.yml

web:
  - test/fixtures/services/web/**
  - .github/workflows/deploy.yml
`;

      // Compare the entire file content
      assertEquals(
        deployContent,
        expectedDeployContent,
        "deploy.yaml content should match expected content"
      );
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
      const output = await runCommand("non-existent-config.yaml");

      // Check command output for error message
      console.log(output);

      // Verify that no output files were created
      assertEquals(
        existsSync("test/output/test_kotlin.yaml"),
        false,
        "test_kotlin.yaml should not be created when config file doesn't exist"
      );
      assertEquals(
        existsSync("test/output/deploy.yaml"),
        false,
        "deploy.yaml should not be created when config file doesn't exist"
      );
    } finally {
      // Clean up test output files
      cleanupOutputFiles();
    }
  },
});
