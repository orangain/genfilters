import { assertEquals } from "jsr:@std/assert@^1.0.12";
import { applyTemplate } from "./template.ts";

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
