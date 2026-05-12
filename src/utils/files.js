import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function resolveInsideRoot(root, ...segments) {
  const base = path.resolve(root);
  const target = path.resolve(base, ...segments);

  if (target !== base && !target.startsWith(`${base}${path.sep}`)) {
    throw new Error(`Path escapes workspace root: ${segments.join("/")}`);
  }

  return target;
}

export function cleanRelativeFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Generated file path must be a non-empty string.");
  }

  if (filePath.includes("\0")) {
    throw new Error(`Invalid file path: ${filePath}`);
  }

  const normalized = path.posix
    .normalize(filePath.replace(/\\/g, "/"))
    .replace(/^\.\//, "");

  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(`Generated file path escapes project: ${filePath}`);
  }

  return normalized;
}

export async function readTextInsideRoot(root, relativePath) {
  const fullPath = resolveInsideRoot(root, relativePath);
  return readFile(fullPath, "utf8");
}

export async function writeFilesInsideRoot(root, relativeDir, files) {
  const projectDir = resolveInsideRoot(root, relativeDir);
  await mkdir(projectDir, { recursive: true });

  const written = [];
  for (const [rawPath, rawContent] of Object.entries(files)) {
    const relativePath = cleanRelativeFilePath(rawPath);
    const fullPath = resolveInsideRoot(projectDir, relativePath);

    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, String(rawContent), "utf8");
    written.push(fullPath);
  }

  return {
    projectDir,
    filesWritten: written
  };
}

export function projectDirInsideRoot(root, relativeDir) {
  return resolveInsideRoot(root, relativeDir);
}
