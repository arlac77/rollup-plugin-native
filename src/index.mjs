import { arch, platform } from "os";
import Module from "module";
import os from "os";
import { resolve, dirname } from "path";

const exportsForModule = new Map();

//const archs={'x64':'x86_64','arm':'armv7l'};

export default function native(options) {
  options = {
    loaderMode: "createRequire",
    arch: arch(),
    platform: platform(),
    ...options
  };
  console.log("OPTIONS", options);

  return {
    name: "native",

    load(id) {
      if (id.endsWith(".node.resolved")) {
        const filename = id.replace(".node.resolved", ".node");
        console.log("LOAD", id, filename);
        const m = new Module(filename);
        m.filename = filename;
        process.dlopen(m, m.filename, os.constants.dlopen.RTLD_NOW);
        console.log("EXPORTS", m.exports);
        const keys = Object.keys(m.exports);
        exportsForModule.set(id, keys);

        return {
          code: `export { ${keys} };`,
          map: null
        };
      }
      return null;
    },

    resolveId(source, importer) {
      if (source.endsWith(".node")) {
        const resolved = resolve(dirname(importer), source + ".resolved");
        console.log("RESOLVEID", source, importer, resolved);
        return { id: resolved, external: false };
      }

      return null;
    },

    transform(code, id) {
      if (code && id.endsWith(".node.resolved")) {
        console.log("TRANSFORM", id);

        let platformId;

        const r = id.match(/(.+)(-(\w+)-(\w+)).node.resolved$/);
        if (r) {
          platformId = id.replace(".node.resolved", ".node");
        } else {
          platformId = id.replace(
            ".node.resolved",
            `-${options.platform}-${options.arch}.node`
          );
        }

        const keys = exportsForModule.get(id);

        let code = "";

        switch (options.loaderMode) {
          case "dlopen":
            code = `
          const Module = require('module');
          const os = require('os');
          const filename = "${platformId}";
          const m = new Module(filename);
          m.filename = filename;
          process.dlopen(m, m.filename, os.constants.dlopen.RTLD_NOW);
          const { ${keys} } = m.exports;
          export { ${keys} };
          `;
            break;

          //case 'createRequire'
          default:
            code = `
          const { createRequire } = require("module");
          const { ${keys} } = createRequire(import.meta.url)("${platformId}");
          export { ${keys} };`;
            break;
        }

        return {
          code,
          map: null
        };
      }
    }
  };
}
