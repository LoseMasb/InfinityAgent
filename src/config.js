import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

function readBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function loadDotEnv(projectRoot) {
  const envPath = path.resolve(projectRoot, ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsAt = trimmed.indexOf("=");
    if (equalsAt <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsAt).trim();
    const value = trimmed
      .slice(equalsAt + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadConfig(overrides = {}) {
  const projectRoot = overrides.projectRoot || process.cwd();
  loadDotEnv(projectRoot);

  const env = process.env;

  const baseUrl = String(
    overrides.baseUrl ||
      env.LLM_API_BASE_URL ||
      env.OPENAI_BASE_URL ||
      "https://api.openai.com/v1"
  ).replace(/\/+$/, "");

  const dryRun = Boolean(overrides.dryRun);
  const apiKey = overrides.apiKey || env.LLM_API_KEY || env.OPENAI_API_KEY || "";
  const offline = Boolean(overrides.offline) || (dryRun && !apiKey);

  return {
    projectRoot,
    apiKey,
    baseUrl,
    model: overrides.model || env.LLM_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini",
    jsonMode: readBoolean(overrides.jsonMode ?? env.LLM_JSON_MODE, true),
    timeoutMs: readNumber(overrides.timeoutMs ?? env.LLM_TIMEOUT_MS, 120000),
    temperature: readNumber(overrides.temperature ?? env.LLM_TEMPERATURE, 0.35),
    offline,
    dryRun
  };
}
