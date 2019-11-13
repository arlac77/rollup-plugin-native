import { arch, platform } from "os";

const keys = ["LISTEN_FDS_START", "notify", "journal_print_object"];

//const archs={'x64':'x86_64','arm':'armv7l'};

export default function native(options = {}) {
  return {
    name: "native",

    load(id) {
      if (id.endsWith(".node.resolved")) {
        console.log("LOAD", id);
        return {
          code: `export { ${keys} };`,
          map: null
        };
      }
      return null;
    },

    resolveId(source, importer) {
      if (source.endsWith(".node")) {
        console.log("RESOLVEID", source, importer);
        return { id: source + ".resolved", external: false };
      }

      return null;
    },

    transform(code, id) {
      if (code && id.endsWith(".node.resolved")) {
        console.log("TRANSFORM", id);

        let platformId;

        const r = id.match(/(.+)(-(\w+)-(\w+)).node.resolved$/);
        if(r) {
          platformId = id.replace(".node.resolved",".node");
        }
        else {
          const a = arch();
          const p = platform();  
          platformId = id.replace(".node.resolved",`-${p}-${a}.node`);
        }

        return {
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
