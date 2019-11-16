import { arch, platform } from "os";
import Module from "module";
import os from "os";
import { resolve,dirname } from "path";

let keys = [ ];

//const archs={'x64':'x86_64','arm':'armv7l'};

export default function native(options = {}) {
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
        keys = Object.keys(m.exports);

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
          const a = arch();
          const p = platform();
          platformId = id.replace(".node.resolved", `-${p}-${a}.node`);
        }

        return {
          /*code: `
          const Module = require('module');
          const os = require('os');
          const m = new Module(filename);
          m.filename = filename;
          process.dlopen(m, m.filename,os.constants.dlopen.RTLD_NOW);
          `,
          */
          code: `
const { createRequire } = require("module");
const { ${keys} } = createRequire(import.meta.url)("${platformId}");
export { ${keys} };`,
          map: null
        };
      }
    }
  };
}
