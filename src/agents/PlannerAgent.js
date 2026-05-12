import { BaseAgent } from "./BaseAgent.js";

export class PlannerAgent extends BaseAgent {
  async run(input, context) {
    this.emit(context, "拆解网站目标、用户和页面结构");

    if (context.config.offline) {
      return {
        summary: `Create a polished Vue website for ${input.name}.`,
        audience: "Potential customers who need to understand the offer quickly.",
        siteMap: ["home"],
        contentBlocks: [
          "hero with clear value proposition",
          "proof and capabilities",
          "workflow",
          "selected work",
          "contact call to action"
        ],
        acceptanceCriteria: [
          "Vite and Vue 3 project can run after npm install",
          "First viewport shows the actual website experience",
          "Responsive layout works on mobile and desktop",
          "No generated file path escapes the workspace"
        ],
        risks: ["Keep copy specific instead of generic marketing filler."]
      };
    }

    const skills = this.skillRegistry.promptBlock(
      this.selectedSkills(context, ["vue-website-maker", "multi-agent-collaboration"])
    );

    return this.llm.chatJson({
      agentName: this.name,
      system: `You are PlannerAgent. Convert a website brief into an implementation plan for a Vue/Vite project.
Return only JSON with this shape:
{
  "summary": "one sentence",
  "audience": "target audience",
  "siteMap": ["page or section names"],
  "contentBlocks": ["ordered content blocks"],
  "acceptanceCriteria": ["testable criteria"],
  "risks": ["risks or unknowns"]
}`,
      user: JSON.stringify(
        {
          projectName: input.name,
          brief: input.brief,
          skills
        },
        null,
        2
      )
    });
  }
}
