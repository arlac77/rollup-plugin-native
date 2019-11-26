import test from "ava";
import { rollup } from "rollup";
import native from "../src/index.mjs";

test("imports", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    plugins: [
      native({
        nodeArchitectureNames: false
      })
    ]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "cjs" });

  t.regex(code.output[0].code, /createRequire\("file/);
});
