[![Build Status](https://secure.travis-ci.org/arlac77/rollup-plugin-native.png)](http://travis-ci.org/arlac77/rollup-plugin-native)
[![downloads](http://img.shields.io/npm/dm/rollup-plugin-native.svg?style=flat-square)](https://npmjs.org/package/rollup-plugin-native)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/rollup-plugin-native)](https://bundlephobia.com/result?p=rollup-plugin-native)
[![npm](https://img.shields.io/npm/v/rollup-plugin-native.svg)](https://www.npmjs.com/package/rollup-plugin-native)


# rollup-plugin-native

Import native code with Rollup.

As there is currently no support for
```js
import {x} from "module.node"
```

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
    format: 'cfs'
  },
  plugins: [
    native({
    platformName: "${dirname}/precompiled/${nodePlatform}-${nodeArchitecture}/node.napi.node",
    //platformName: "${dirname}/${basename}-${nativePlatform}-${nativeArchitecture}.node",
    })
  ]
}
```

```js
import { funcA, constB } from "../module.node";

funcA(); // native call

```

will generate a dlopen / require for
"../precompiled/linux-x86/node.napi.node"

Substitution properties in the platformName 
- dirname dirname
- basename basename (.node stiped away)
- nodePlatform from process.platform()
- nodeArchitecture from process.arch()
- nativePlatform as given from uname
- nativeArchitecture as used in llvm & gcc

## License

BSD
