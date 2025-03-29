import { assertEquals, assertThrows } from "std/assert/mod.ts";
import { parseConfigFile } from "./config.ts";

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
