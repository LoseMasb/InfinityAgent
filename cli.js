#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadConfig } from "./src/config.js";
import { MultiAgentOrchestrator } from "./src/orchestrator/MultiAgentOrchestrator.js";
import { SkillRegistry } from "./src/skills/SkillRegistry.js";
import { resolveInsideRoot } from "./src/utils/files.js";

function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function showHelp() {
  console.log(`Infinity Vue Agent

Usage:
  node cli.js generate --name <site-name> --brief "<website brief>"
  node cli.js generate --offline --name demo --brief-file examples/briefs/landing.zh.md
  node cli.js generate --skills vue-website-maker,design-system --dry-run --brief "..."
  node cli.js skills
  node cli.js check

Options:
  --brief <text>        Website requirements in plain text.
  --brief-file <path>   Read requirements from a file inside this workspace.
  --name <name>         Output project name. Defaults to vue-site.
  --out <dir>           Output directory inside this workspace. Defaults to generated-sites.
  --skills <ids>        Comma-separated skill ids to add to the agent context.
  --offline             Use deterministic local agents instead of an API call.
  --dry-run             Run the full pipeline without writing files.
  --model <model>       Override LLM_MODEL.
  --base-url <url>      Override LLM_API_BASE_URL.
  --help                Show this help.
`);
}

async function readBrief(args, projectRoot) {
  if (args.brief) {
    return String(args.brief);
  }

  if (args["brief-file"]) {
    const briefPath = resolveInsideRoot(projectRoot, args["brief-file"]);
    return readFile(briefPath, "utf8");
  }

  return "";
}

function printEvent(event) {
  const agent = event.agent ? `[${event.agent}]` : "[flow]";
  console.log(`${agent} ${event.message}`);
}

function parseSkillIds(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function listSkills(projectRoot) {
  const registry = new SkillRegistry({
    skillsDir: path.join(projectRoot, "skills")
  });
  const skills = await registry.load();

  if (skills.length === 0) {
    console.log("No skills found in skills/.");
    return;
  }

  for (const skill of skills) {
    console.log(`- ${skill.id} | ${skill.name}: ${skill.summary}`);
  }
}

function showCheck(config) {
  console.log("Runtime check");
  console.log(`- projectRoot: ${config.projectRoot}`);
  console.log(`- baseUrl: ${config.baseUrl}`);
  console.log(`- model: ${config.model}`);
  console.log(`- jsonMode: ${config.jsonMode}`);
  console.log(`- apiKey: ${config.apiKey ? "configured" : "missing"}`);
  console.log(`- offline: ${config.offline}`);
  console.log(`- dryRun: ${config.dryRun}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "help";
  const projectRoot = process.cwd();

  if (args.help || command === "help") {
    showHelp();
    return;
  }

  if (command === "skills") {
    await listSkills(projectRoot);
    return;
  }

  const config = loadConfig({
    projectRoot,
    offline: Boolean(args.offline),
    dryRun: Boolean(args["dry-run"]),
    model: args.model,
    baseUrl: args["base-url"]
  });

  if (command === "check") {
    showCheck(config);
    return;
  }

  if (command !== "generate") {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exitCode = 1;
    return;
  }

  const brief = await readBrief(args, projectRoot);
  if (!brief.trim()) {
    console.error("Missing --brief or --brief-file.");
    process.exitCode = 1;
    return;
  }

  const orchestrator = new MultiAgentOrchestrator({
    config,
    onEvent: printEvent
  });

  const requestedSkillIds = parseSkillIds(args.skills);
  const skillRegistry = new SkillRegistry({
    skillsDir: path.join(projectRoot, "skills")
  });
  await skillRegistry.load();
  const skillIds = skillRegistry.resolveSkillIds(requestedSkillIds);
  if (requestedSkillIds.length > 0 && skillIds.length !== requestedSkillIds.length) {
    const missing = requestedSkillIds.filter((id) => !skillIds.includes(id));
    console.warn(`Ignoring unknown skill ids: ${missing.join(", ")}`);
  }

  const result = await orchestrator.generateVueSite({
    name: args.name || "vue-site",
    brief,
    outDir: args.out || "generated-sites",
    skillIds,
    dryRun: Boolean(args["dry-run"])
  });

  console.log("");
  console.log(result.dryRun ? "Preview complete." : "Done.");
  console.log(`- Project: ${result.projectDir}`);
  console.log(`- Files: ${result.filesWritten.length}`);
  console.log(`- Report: ${result.reportFile}`);
  if (result.dryRun) {
    console.log(`- Planned files: ${result.plannedFiles.length}`);
  }
}

main().catch((error) => {
  console.error("");
  console.error("Generation failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
