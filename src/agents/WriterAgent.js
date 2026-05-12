import path from "node:path";
import { BaseAgent } from "./BaseAgent.js";
import { stableStringify } from "../utils/json.js";
import { slugify } from "../utils/slug.js";
import { projectDirInsideRoot, writeFilesInsideRoot } from "../utils/files.js";

export class WriterAgent extends BaseAgent {
  async run(input, context) {
    this.emit(context, "写入当前工作区内的生成目录");

    const slug = slugify(input.name);
    const relativeDir = path.posix.join(input.outDir || "generated-sites", slug);
    const reportFile = ".agent-report.json";
    const files = {
      ...input.code.files,
      [reportFile]: stableStringify(input.report)
    };

    if (input.dryRun) {
      const projectDir = projectDirInsideRoot(context.config.projectRoot, relativeDir);
      return {
        projectDir,
        relativeDir,
        reportFile: path.join(projectDir, reportFile),
        filesWritten: [],
        plannedFiles: Object.keys(files),
        dryRun: true
      };
    }

    const result = await writeFilesInsideRoot(context.config.projectRoot, relativeDir, files);

    return {
      ...result,
      relativeDir,
      reportFile: path.join(result.projectDir, reportFile)
    };
  }
}
