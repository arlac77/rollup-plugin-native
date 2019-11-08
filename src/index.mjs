import { readFile } from 'fs';

export default function native(options = {}) {
  return {
    name: 'native',

    load(id) {

      if (/\.node$/.test(id)) {
        console.log("LOAD", id);

        return new Promise((res, reject) => {
          readFile(id, (error, buffer) => {
            if (error != null) {
              reject(error);
            }
            res(buffer.toString('binary'));
          });
        });
      }
      return null;
    },

    banner: `
      import { createRequire } from "module";
    `.trim(),

    transform(code, id) {
      if (code && /\.node$/.test(id)) {
        console.log("TRANSFORM", id);
        return `export default function(imports){ const require = createRequire(import.meta.url); return require('../systemd-linux-arm.node'); }`;
      }
    }
  };
}
