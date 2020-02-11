import { builtinModules } from "module";
import { dependencies, devDependencies } from "../../package.json";
import productionRollupConfig from "../../rollup.config.js";

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
