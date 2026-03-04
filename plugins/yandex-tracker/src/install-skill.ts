import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

export function installSkill(silent = false): void {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sourceDir = join(__dirname, "..", "skills", "yandex-tracker");
  const targetDir = join(homedir(), ".claude", "skills", "yandex-tracker");

  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });

  if (!silent) {
    console.log(`Skill installed to ${targetDir}`);
    console.log("Files: SKILL.md, references/workflows.md");
  }
}
