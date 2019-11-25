# rollup-plugin-native

Import native code with Rollup.


## Installation

```bash
npm install --save-dev rollup-plugin-native
```


## Usage

```js
// rollup.config.js
import native from 'rollup-plugin-native';

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife'
  },
  plugins: [
    native()
  ]
}
```

```js
import { funcA, constB } from "../precompiled/module.node";

funcA(); // native call

```


## License

BSD