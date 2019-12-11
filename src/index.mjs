import { arch, platform, constants } from "os";
import { resolve, dirname, basename } from "path";
import Module from "module";
import { createFilter } from "@rollup/pluginutils";

const nodePlatformToNativePlatform = {
  darwin: "mac",
  linux: "linux"
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

function platformName(id, options) {
  const r = id.match(/(.+)(-(\w+)-(\w+)).node$/);
  if (r) {
    return id;
  } else {
    const properties = {
      dirname: dirname(id),
      basename: basename(id, ".node"),
      nodePlatform: platform(),
      nativePlatform: nodePlatformToNativePlatform[platform()],
      nodeArchitecture: arch(),
      nativeArchitecture: nodeArchToNativeArch[arch()]
    };
    return options.platformName.replace(
      /\${([^}]+)}/g,
      (match, key, offset, string) => {
        if (properties[key] === undefined) {
          throw new Error(`No such key '${key}' in (${properties})`);
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
      "${dirname}/${basename}-${nodePlatform}-${nodeArchitecture}.node",
    //platformName: "${dirname}/${basename}-${nativePlatform}-${nativeArchitecture}.node",
    ...options
  };

  const exportsForModule = new Map();

  const filter = createFilter(options.include, options.exclude);

  return {
    name: "native",

    load(id) {
      if (id.endsWith(".node")) {
        console.log("LOAD", id);
        const m = new Module(id);
        m.filename = id;
        process.dlopen(m, id, constants.dlopen.RTLD_NOW);
        console.log("EXPORTS", m.exports);
        const keys = Object.keys(m.exports);
        exportsForModule.set(id, keys);

        return { code: `export { ${keys} };` };
      }
      return null;
    },

    resolveId(source, importer) {
      if (source.endsWith(".node")) {
        const resolved = resolve(
          dirname(importer),
          platformName(source, options)
        );
        console.log("RESOLVEID", source, importer, resolved);
        return { id: resolved, external: false };
      }

      return null;
    },

    transform(code, id) {
      if (!filter(id)) return;

      if (code && id.endsWith(".node")) {
        console.log("TRANSFORM", id);

        const keys = exportsForModule.get(id);

        const filename = id.substring(process.cwd().length);

        let code = "";

        switch (options.loaderMode) {
          case "dlopen":
            const formatSpecific = false
              ? `const filename = __dirname + "/..${filename}";`
              : `import { dirname, join } from "path";
          import { fileURLToPath } from "url";
          const filename = join(dirname(fileURLToPath(import.meta.url)),"..${filename}");`;

            code = `
          import { Module } from "module";
          import { constants } from "os";
          ${formatSpecific}
          const m = new Module(filename);
          m.filename = filename;
          process.dlopen(m, filename, constants.dlopen.RTLD_NOW);
          const { ${keys} } = m.exports;
          export { ${keys} };
          `;
            break;

          //case 'createRequire'
          default:
            code = `
          import { createRequire } from "module";
          const { ${keys} } = createRequire("file://" + __filename)("..${filename}");
          export { ${keys} };`;
            break;
        }

        return { code };
      }
    }
  };
}

function invertKeyValues(object) {
  return Object.fromEntries(Object.entries(object).map(([k, v]) => [v, k]));
}
