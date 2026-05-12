import { BaseAgent } from "./BaseAgent.js";
import { cleanRelativeFilePath } from "../utils/files.js";

export class ValidatorAgent extends BaseAgent {
  async run(input, context) {
    this.emit(context, "执行本地静态校验");

    const errors = [];
    const warnings = [];
    const files = input.code.files || {};
    const required = [
      "package.json",
      "index.html",
      "vite.config.js",
      "src/main.js",
      "src/data/site.js",
      "src/App.vue",
      "src/styles.css",
      "README.md"
    ];

    for (const requiredPath of required) {
      if (!files[requiredPath]) {
        errors.push(`Missing required file: ${requiredPath}`);
      }
    }

    for (const filePath of Object.keys(files)) {
      try {
        cleanRelativeFilePath(filePath);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (files["package.json"]) {
      try {
        const pkg = JSON.parse(files["package.json"]);
        if (!pkg.scripts?.dev) {
          errors.push("package.json must include scripts.dev.");
        }
        const dependencies = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {})
        };
        if (!dependencies.vue) {
          errors.push("package.json must include vue.");
        }
        if (!dependencies.vite) {
          errors.push("package.json must include vite.");
        }
      } catch {
        errors.push("package.json is not valid JSON.");
      }
    }

    const app = files["src/App.vue"] || "";
    if (app && !app.includes("<template")) {
      errors.push("src/App.vue must include a template block.");
    }
    if (app && app.length < 800) {
      warnings.push("src/App.vue is quite short; the generated site may be thin.");
    }

    return {
      status: errors.length > 0 ? "failed" : "passed",
      errors,
      warnings
    };
  }
}
