
export default function native(options = {}) {
  return {
    name: 'native',

/*
    load(id) {
      if (id.endsWith('.node')) {
        console.log("LOAD", id);
        return { journal_print_object: "" };
      }
      return null;
    },
*/

    banner: `
      import { createRequire } from "module";
    `,

    transform(code, id) {
      if (code && id.endsWith('.node')) {
        console.log("TRANSFORM", code, id);
        return { 
           //code: `export default function(imports){ const require = createRequire(import.meta.url); return require('../systemd-linux-arm.node'); }`,
           code: `export const LISTEN_FDS_START = 0; export function notify() {}  export function journal_print_object() {} `,
           map: null };
      }
    }
  };
}
