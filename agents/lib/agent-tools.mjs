import { tool } from "@openai/agents";
import { z } from "zod";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const ROOT = process.cwd();
export const SOURCE_FILES = new Set([
  "src/Grade12LearningHub.tsx",
  "src/AcademyCouncil.tsx",
  "src/grade12-learning.css",
  "src/academy-council.css",
  "src/data/grade12-physics-extra-questions.ts",
  "src/data/learning.ts",
]);
const READ_FILES = new Set([...SOURCE_FILES, "README.md", "package.json", "agents/README.md"]);
const LOCKED = new Set(["src/lib/auth.tsx", "src/lib/auth.ts", "src/lib/supabase.ts", "src/lib/supabase.js"]);

export function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: ROOT, encoding: "utf8", maxBuffer: 3 * 1024 * 1024,
    timeout: 120000, ...options,
  });
}
function safePath(raw) {
  if (typeof raw !== "string" || !raw.trim()) throw new Error("مسار غير صالح.");
  const value = raw.trim().replaceAll("\\", "/");
  if (value.startsWith("/") || value.includes("\0")) throw new Error("المسار يجب أن يكون نسبياً.");
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) throw new Error("المسار خارج المشروع.");
  return normalized;
}
export function readTool() {
  return tool({
    name: "read_project_file",
    description: "Read one allow-listed source or documentation file. Authentication, database, secret, CI, workflow, and settings files are not accessible.",
    parameters: z.object({ path: z.string(), startLine: z.number().int().min(1).optional(), maxLines: z.number().int().min(10).max(220).optional() }),
    async execute({ path: file, startLine = 1, maxLines = 120 }) {
      const target = safePath(file);
      if (!READ_FILES.has(target) || LOCKED.has(target)) return "READ BLOCKED: file is outside your read permissions.";
      let body;
      try { body = await readFile(path.resolve(ROOT, target), "utf8"); }
      catch { return "FILE NOT FOUND: " + target; }
      const lines = body.split(/\r?\n/);
      const first = Math.min(startLine, lines.length) - 1;
      const excerpt = lines.slice(first, first + maxLines)
        .map((line, i) => String(first + i + 1).padStart(4, " ") + " | " + line).join("\n");
      return JSON.stringify({
        path: target, totalLines: lines.length,
        sha256: createHash("sha256").update(body).digest("hex"),
        excerpt, truncated: first + maxLines < lines.length,
      });
    },
  });
}
export function listTool() {
  return tool({
    name: "list_project_files",
    description: "List the source/documentation files that agents may inspect.",
    parameters: z.object({}),
    async execute() { return JSON.stringify([...READ_FILES].sort()); },
  });
}
export function reportTool(role, reportRoot) {
  return tool({
    name: "save_report",
    description: "Save your findings in your own report file. This does not modify application source.",
    parameters: z.object({ content: z.string().min(1).max(12000) }),
    async execute({ content }) {
      const folder = path.join(ROOT, reportRoot, role);
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, "report.md"), content, "utf8");
      return "Report saved for " + role + ".";
    },
  });
}
export function patchTool(role, allowedPaths) {
  return tool({
    name: "apply_scoped_patch",
    description: "Apply a unified diff only to your allow-listed source files. Deletions, renames, authentication, database, workflow, package, secret, and unrelated files are blocked.",
    parameters: z.object({ patch: z.string().min(1).max(20000) }),
    async execute({ patch }) {
      const paths = new Set();
      for (const line of patch.split(/\r?\n/)) {
        if (line.startsWith("diff --git ")) {
          const header = line.match(/^diff --git a\/(.+) b\/(.+)$/);
          if (!header) throw new Error("Unrecognized diff header; only simple file patches are accepted.");
          paths.add(safePath(header[1]));
          paths.add(safePath(header[2]));
        }
        if (line.startsWith("+++ b/")) paths.add(safePath(line.slice(6).split("\t")[0]));
        if (line.startsWith("--- a/")) paths.add(safePath(line.slice(6).split("\t")[0]));
        if (line.startsWith("rename from ") || line.startsWith("rename to ")) {
          throw new Error("File renames are not allowed.");
        }
        if (line.includes("/dev/null")) throw new Error("Adding or deleting files is not allowed.");
      }
      const files = [...paths];
      if (!files.length) throw new Error("Patch contains no file paths.");
      const denied = files.filter((file) => !allowedPaths.has(file));
      if (denied.length) throw new Error("PATCH BLOCKED: " + denied.join(", "));
      git(["apply", "--check", "--whitespace=error", "-"], { input: patch });
      git(["apply", "--whitespace=error", "-"], { input: patch });
      return JSON.stringify({ applied: true, files });
    },
  });
}
export function diffTool() {
  return tool({
    name: "inspect_source_diff",
    description: "Inspect the current proposed source diff. Read-only.",
    parameters: z.object({}),
    async execute() {
      const files = git(["diff", "--name-only"]).trim();
      const diff = git(["diff", "--"]);
      return JSON.stringify({ files, diff: diff.slice(0, 18000), truncated: diff.length > 18000 });
    },
  });
}
export function changedFiles() {
  const tracked = git(["diff", "--name-only"]).trim().split(/\r?\n/).filter(Boolean);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]).trim().split(/\r?\n/).filter(Boolean);
  return [...new Set([...tracked, ...untracked])];
}
export async function validateChanges(files, reportRoot) {
  const prefix = reportRoot.replaceAll("\\", "/") + "/";
  const invalid = files.filter((file) => !SOURCE_FILES.has(file) && !file.startsWith(prefix));
  if (invalid.length) throw new Error("Changes outside the council's permitted scope: " + invalid.join(", "));
  const patterns = [/sk-[A-Za-z0-9_-]{20,}/, /gh[pousr]_[A-Za-z0-9_]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
  for (const file of files) {
    let content = "";
    try { content = await readFile(path.resolve(ROOT, file), "utf8"); } catch { continue; }
    if (patterns.some((pattern) => pattern.test(content))) {
      throw new Error("Secret-like string detected in a changed file: " + file);
    }
  }
  return files;
}
