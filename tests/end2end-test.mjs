import execa from "execa";
import test from "ava";

import { join, dirname } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));

async function et(t, format, loaderMode = "createRequire") {
  const p = await execa("node", [
    join(here, "..", "build", `imports-${loaderMode}.${format}`)
  ]);

  t.is(
    p.stdout,
    "*** start ***\n" + "77\n" + "4711\n" + "plain\n" + "*** end ***"
  );
}

et.title = (providedTitle = "end2end", format, loaderMode = "createRequire") =>
  `${providedTitle} ${format} ${loaderMode}`.trim();

test(et, "js", "createRequire");
test(et, "js", "dlopen");
