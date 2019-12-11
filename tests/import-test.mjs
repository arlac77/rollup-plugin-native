import test from "ava";
import { rollup } from "rollup";
import native from "../src/index.mjs";

test("imports native naming - cjs", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    output: { file: `build/native_naming_cjs.js`, format: "cjs" },
    plugins: [
      native({
        platformName: "${basename}-${nativePlatform}-${nativeArchitecture}.node"
      })
    ]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "cjs" });

  t.regex(code.output[0].code, /createRequire\("file/);
});

test("imports node naming - cjs", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    output: { file: `build/node_naming_cjs.js`, format: "cjs" },
    plugins: [native()]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "cjs" });

  t.regex(code.output[0].code, /createRequire\("file/);
});

test("imports node naming - createRequire/esm", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    plugins: [native()]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "esm" });

  t.regex(code.output[0].code, /createRequire\("file/);
});

test("imports node naming - dlopen/esm", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    plugins: [native({ loaderMode: "dlopen" })]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "esm" });

  t.regex(code.output[0].code, /fileURLToPath\(/);
  t.regex(code.output[0].code, /process.dlopen\(/);
});

test("imports node naming - dlopen/cjs", async t => {
  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    plugins: [native({ loaderMode: "dlopen" })]
  });

  t.truthy(bundle);

  const code = await bundle.generate({ format: "cjs" });

  t.regex(code.output[0].code, /__dirname/);
  t.regex(code.output[0].code, /process.dlopen\(/);
});
