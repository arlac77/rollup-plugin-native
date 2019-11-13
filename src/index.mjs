export default function native(options = {}) {
  return {
    name: "native",

    /*banner: `
    import { createRequire } from "module";
  `,*/

    load(id) {
      if (id.endsWith(".node.resolved")) {
        console.log("LOAD", id);
        return {
          code: `export { LISTEN_FDS_START, notify, journal_print_object };`,
          xcode: `
        {export const LISTEN_FDS_START = 3;
        export function notify(){};
        export function journal_print_object() {};}`,
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
        return {
          code: `
const { createRequire } = require("module");
const { LISTEN_FDS_START, notify, journal_print_object } = createRequire(import.meta.url)("${id.replace('.resolved','')}");
export { LISTEN_FDS_START, notify, journal_print_object };`,
          map: null
        };
      }
    }
  };
}
