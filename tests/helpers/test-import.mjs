import test from "ava";
import { rollup } from "rollup";
import native from "../../src/index.mjs";

async function it(
  t,
  format,
  loaderMode = "createRequire",
  platformName,
  regex
) {
  //  const platformName =
  //  "${basename}-${nativePlatform}-${nativeArchitecture}.node";

  if (platformName === undefined) {
    platformName =
      "${dirname}/${basename}-${nodePlatform}-${nodeArchitecture}.node";
  }

  const outputOptions = { format };
  const nativeOptions = { loaderMode, platformName };

  const bundle = await rollup({
    input: "tests/fixtures/imports.mjs",
    output: { file: `build/node_naming_cjs.js`, format },
    plugins: [native(nativeOptions)]
  });

  t.truthy(bundle);

  const code = await bundle.generate(outputOptions);

  t.regex(code.output[0].code, regex);
}

it.title = (providedTitle = "import native", format, loaderMode = "createRequire") =>
  `${providedTitle} ${format} ${loaderMode}`.trim();

test.skip(it, "cjs", "createRequire", undefined, /createRequire\("file/);

//test(it, "es", "createRequire", /createRequire\(import.meta.url/);

test(it, "cjs", "dlopen", undefined, /process.dlopen/);
test(it, "es", "dlopen", undefined, /process.dlopen/);
