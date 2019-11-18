import { builtinModules } from 'module';
import { dependencies } from './package.json';

export default
  {
    input: 'src/index.mjs',
    output: { exports: 'named', file: 'dist/index.js', format: 'cjs' },
    external: [...builtinModules, ...Object.keys(dependencies || {})]
  };

