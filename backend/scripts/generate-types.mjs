import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../types/database.ts");

const result = spawnSync("supabase", ["gen", "types", "typescript", "--linked"], {
  encoding: "utf8",
  shell: true
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

writeFileSync(outputPath, result.stdout);
console.log(`Generated ${outputPath}`);
