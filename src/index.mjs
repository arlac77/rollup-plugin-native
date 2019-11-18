import { arch, platform, constants } from "os";
import Module from "module";
import { resolve, dirname } from "path";
import { createFilter } from 'rollup-pluginutils';

const exportsForModule = new Map();

//const archs={'x64':'x86_64','arm':'armv7l'};

function platformName(id, options) {
  const r = id.match(/(.+)(-(\w+)-(\w+)).node$/);
  if (r) {
    return id;
  } else {
    return id.replace(
      ".node",
      `-${options.platform}-${options.arch}.node`
    );
  }

}

export default function native(options) {
  options = {
    loaderMode: "createRequire",
    arch: arch(),
    platform: platform(),
    ...options
  };

  const filter = createFilter( options.include, options.exclude );

  return {
    name: "native",

    load(id) {
      if (id.endsWith(".node")) {
        console.log("LOAD", id );
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
        const resolved = resolve(dirname(importer), platformName(source, options));
        console.log("RESOLVEID", source, importer, resolved);
        return { id: resolved, external: false };
      }

      return null;
    },

    transform(code, id) {
      if ( !filter( id ) ) return;

      if (code && id.endsWith(".node")) {
        console.log("TRANSFORM", id);

        const keys = exportsForModule.get(id);

        let code = "";

        switch (options.loaderMode) {
          case "dlopen":
            code = `
          import { Module } from "module";
          import { constants } from "os";
          const filename = "${id}";
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
          const { ${keys} } = createRequire(import.meta.url)("${id}");
          export { ${keys} };`;
            break;
        }

        return { code };
      }
    }
  };
}
