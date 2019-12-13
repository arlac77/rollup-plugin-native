import { builtinModules } from "module";
import native from "../../src/index.mjs";

const external = [...builtinModules];

export default [
  {
    input: `tests/fixtures/imports.mjs`,
    output: {
      file: `build/imports-createRequire.js`,
      format: "cjs"
    },
    external,
    plugins: [native({ loaderMode: "createRequire" })]
  },
  {
    input: `tests/fixtures/imports.mjs`,
    output: {
      file: `build/imports-createRequire.mjs`,
      format: "esm"
    },
    external,
    plugins: [native({ loaderMode: "createRequire" })]
  },
  {
    input: `tests/fixtures/imports.mjs`,
    output: {
      file: `build/imports-dlopen.js`,
      format: "cjs"
    },
    external,
    plugins: [native({ loaderMode: "dlopen" })]
  },
  {
    input: `tests/fixtures/imports.mjs`,
    output: {
      file: `build/imports-dlopen.mjs`,
      format: "esm"
    },
    external,
    plugins: [native({ loaderMode: "dlopen" })]
  }
];
