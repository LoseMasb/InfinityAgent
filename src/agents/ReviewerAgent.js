import { BaseAgent } from "./BaseAgent.js";

function summarizeFiles(files) {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, content]) => [
      filePath,
      String(content).slice(0, 5000)
    ])
  );
}

export class ReviewerAgent extends BaseAgent {
  async run(input, context) {
    this.emit(context, "审查体验完整度、代码风险和遗漏项");

    if (context.config.offline) {
      return {
        status: "approved",
        issues: [],
        fixBrief: "",
        notes: ["Offline review approved the deterministic scaffold."]
      };
    }

    const skills = this.skillRegistry.promptBlock(
      this.selectedSkills(context, ["quality-review", "vue-website-maker"])
    );

    return this.llm.chatJson({
      agentName: this.name,
      system: `You are ReviewerAgent. Review generated Vue website files for product quality, Vue correctness, responsive UI, and completeness.
Return only JSON:
{
  "status": "approved" | "changes_requested",
  "issues": ["specific issue"],
  "fixBrief": "concise instructions for VueCoderAgent if changes are requested",
  "notes": ["optional notes"]
}`,
      user: JSON.stringify(
        {
          brief: input.brief,
          plan: input.plan,
          design: input.design,
          content: input.content,
          files: summarizeFiles(input.code.files),
          skills
        },
        null,
        2
      )
    });
  }
}
