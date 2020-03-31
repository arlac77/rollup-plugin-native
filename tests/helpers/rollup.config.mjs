import { readFileSync } from "fs";
import { builtinModules } from "module";
import productionRollupConfig from "../../rollup.config.mjs";
const { dependencies, devDependencies } = JSON.parse(readFileSync("package.json",{encoding:"utf8"}));

const external = [
  ...builtinModules,
  ...Object.keys(dependencies),
  ...Object.keys(devDependencies)
];

const testFiles = ["test-import"];

export default [
  productionRollupConfig,
  ...testFiles.map(file => {
    return {
      input: `tests/helpers/${file}.mjs`,
      output: { exports: "named", file: `build/${file}.js`, format: "cjs" },
      external
    };
  })
];
