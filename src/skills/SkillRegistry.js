import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

function summarize(content) {
  const line = content
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith("#"));

  return line ? line.replace(/^[-*]\s*/, "") : "No summary.";
}

function nameFromMarkdown(fileName, content) {
  const heading = content
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith("# "));

  if (heading) {
    return heading.replace(/^#\s+/, "").trim();
  }

  return path.basename(fileName, ".md");
}

export class SkillRegistry {
  constructor({ skillsDir }) {
    this.skillsDir = skillsDir;
    this.skills = [];
  }

  async load() {
    let entries = [];
    try {
      entries = await readdir(this.skillsDir, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") {
        this.skills = [];
        return this.skills;
      }
      throw error;
    }

    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();

    this.skills = [];
    for (const fileName of files) {
      const fullPath = path.join(this.skillsDir, fileName);
      const content = await readFile(fullPath, "utf8");
      this.skills.push({
        id: path.basename(fileName, ".md"),
        name: nameFromMarkdown(fileName, content),
        summary: summarize(content),
        content
      });
    }

    return this.skills;
  }

  resolveSkillIds(skillIds = []) {
    const requested = new Set(
      skillIds
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    );

    if (requested.size === 0) {
      return [];
    }

    return this.skills
      .filter((skill) => requested.has(skill.id))
      .map((skill) => skill.id);
  }

  promptBlock(ids = []) {
    const selected =
      ids.length === 0
        ? this.skills
        : this.skills.filter((skill) => ids.includes(skill.id));

    return selected
      .map((skill) => `## ${skill.name}\n${skill.content}`)
      .join("\n\n");
  }

  listSummary() {
    return this.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      summary: skill.summary
    }));
  }
}
