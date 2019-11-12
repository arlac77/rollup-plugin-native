
export default function native(options = {}) {
  return {
    name: 'native',

    load(id) {
      if (/\.node$/.test(id)) {
        console.log("LOAD", id);
      }
      return null;
    },

    banner: `
      import { createRequire } from "module";
    `,

    transform(code, id) {
      if (code && /\.node$/.test(id)) {
        console.log("TRANSFORM", id);
        return `export default function(imports){ const require = createRequire(import.meta.url); return require('../systemd-linux-arm.node'); }`;
      }
    }
  };
}
