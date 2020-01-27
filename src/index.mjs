import { arch, platform, constants } from "os";
import { resolve, dirname, basename } from "path";
import Module from "module";
import { createFilter } from "@rollup/pluginutils";
import readPkgUp from "read-pkg-up";

const nodePlatformToNativePlatform = {
  aix: "aix",
  darwin: "mac",
  freebsd: "freebsd",
  linux: "linux",
  openbsd: "openbsd",
  sunos: "sunos",
  win32: "win32"
};

const nativePlatformToNodePlatform = invertKeyValues(
  nodePlatformToNativePlatform
);

const nodeArchToNativeArch = {
  x64: "x86_64",
  arm: "armv7l",
  arm64: "aarch64",
  ia32: "ia32",
  mips: "mips",
  mipsel: "mipsel",
  ppc: "ppc",
  ppc64: "ppc64",
  s390: "s390",
  s390x: "s390x",
  x32: "x32"
};

const nativeArchToNodeArch = invertKeyValues(nodeArchToNativeArch);

/**
 * resolve .node file from options and package.json
 * @param {string } id 
 * @param {Object} pkg decoded content of package.json
 * @param {Object} options 
 */
function platformName(id, pkg, options) {

  let pattern = options.platformName;

  if(pkg.native) {
    pattern = pkg.native;
  }

  if(pkg.devDependencies && pkg.devDependencies.prebuildify) {
    pattern = "prebuilds/${os}-${arch}/node.napi.node";
  }

  const r = id.match(/(.+)(-(\w+)-(\w+)).node$/);
  if (r) {
    return id;
  } else {
    const properties = {
      dirname: dirname(id),
      basename: basename(id, ".node"),
      platform: platform(),
      os: nodePlatformToNativePlatform[platform()],
      arch: arch(),
      nativeArch: nodeArchToNativeArch[arch()]
    };
    return pattern.replace(
      /\${([^}]+)}/g,
      (match, key, offset, string) => {
        if (properties[key] === undefined) {
          throw new Error(`No such key '${key}' in (${JSON.stringify(properties)})`);
        }
        return properties[key];
      }
    );
  }
}

export default function native(options) {
  options = {
    loaderMode: "createRequire",
    platformName:
      "${dirname}/${basename}-${os}-${nativeArch}.node",
    ...options
  };

  const exportsForModule = new Map();

  const filter = createFilter(options.include, options.exclude);

  function generateCode(filename, keys, format) {
    switch (options.loaderMode) {
      case "dlopen":
        const formatSpecific =
          format === "cjs"
            ? `const filename = __dirname + "/" + "${filename}";`
            : `import { dirname, join } from "path";
      import { fileURLToPath } from "url";
      const filename = join(dirname(fileURLToPath(import.meta.url)),"${filename}");`;

        return `
      import { Module } from "module";
      import { constants } from "os";
      ${formatSpecific}
      const m = new Module(filename);
      m.filename = filename;
      process.dlopen(m, filename, constants.dlopen.RTLD_NOW);
      const { ${keys} } = m.exports;`;

      default:
        return `
      import { createRequire } from "module";
      const { ${keys} } = createRequire(${
          format === "cjs" ? '"file://" + __dirname' : "import.meta.url"
        })("${filename}");`;
    }
  }

  return {
    name: "native",

    /*
    generateBundle(options, bundle, isWrite) {
      Object.values(bundle).forEach(b => {
        const id = b.facadeModuleId;
        const filename = '..' + id.slice(process.cwd().length);  
        b.code = b.code.replace(/const\s*\{[^\}]+\}=__NATIVE_IMPORT__/,() => generateCode(filename, b.exports, options.format));
      });
    },*/

    load(id) {
      if (id.endsWith(".node")) {
        //console.log("LOAD", id);
        const m = new Module(id);
        m.filename = id;
        process.dlopen(m, id, constants.dlopen.RTLD_NOW);
        //console.log("EXPORTS", m.exports);
        const keys = Object.keys(m.exports);
        exportsForModule.set(id, keys);

        return {
          code: `const {${keys}}=__NATIVE_IMPORT__;export {${keys}};`
        };
      }
      return null;
    },

    async resolveId(source, importer) {
      if (source.endsWith(".node")) {
        const { packageJson } = await readPkgUp({ cwd: dirname(importer) });

        const resolved = resolve(
          dirname(importer),
          platformName(source, packageJson, options)
        );
        //console.log("RESOLVEID", source, importer, resolved);
        return { id: resolved, external: false };
      }

      return null;
    },

    transform(code, id) {
      if (!filter(id)) return;

      if (code && id.endsWith(".node")) {
        const keys = exportsForModule.get(id);
        const filename = ".." + id.slice(process.cwd().length);
        console.log("TRANSFORM", id, filename);
        return {
          code: generateCode(filename, keys, "es") + `;export {${keys}}`
        };
      }
    }
  };
}

function invertKeyValues(object) {
  return Object.fromEntries(Object.entries(object).map(([k, v]) => [v, k]));
}
