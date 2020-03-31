import { builtinModules } from "module";
import { readFileSync } from "fs";
const { dependencies } = JSON.parse(readFileSync("./package.json",{encoding:"utf8"}));

export default {
  input: "src/index.mjs",
  output: { exports: "named", file: "dist/index.js", format: "cjs" },
  external: [...builtinModules, ...Object.keys(dependencies)]
};
