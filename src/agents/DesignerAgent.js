import { BaseAgent } from "./BaseAgent.js";

export class DesignerAgent extends BaseAgent {
  async run(input, context) {
    this.emit(context, "制定视觉方向、设计 token 和响应式规则");

    if (context.config.offline) {
      return {
        direction:
          "A focused studio-quality interface with crisp typography, useful density, and a balanced color system.",
        designTokens: {
          colors: {
            background: "#f7f5ef",
            surface: "#ffffff",
            ink: "#151719",
            muted: "#667085",
            accent: "#0f766e",
            secondary: "#7c3aed",
            warm: "#f59e0b"
          },
          radius: "8px",
          spacing: "8px grid",
          typography: "system sans serif with strong hierarchy"
        },
        layout:
          "Full-width bands with constrained content, dense cards only for repeated items, and a visible next section below the hero.",
        interactions: ["hover elevation on work cards", "sticky top navigation", "clear CTA focus states"],
        responsiveRules: [
          "single column below 720px",
          "avoid viewport-scaled font sizes",
          "keep button text wrapping safe"
        ]
      };
    }

    const skills = this.skillRegistry.promptBlock(
      this.selectedSkills(context, ["design-system", "vue-website-maker"])
    );

    return this.llm.chatJson({
      agentName: this.name,
      system: `You are DesignerAgent. Create a compact design specification for a Vue website.
Return only JSON with this shape:
{
  "direction": "visual direction",
  "designTokens": {
    "colors": {},
    "radius": "value",
    "spacing": "value",
    "typography": "value"
  },
  "layout": "layout guidance",
  "interactions": ["interaction notes"],
  "responsiveRules": ["rules"]
}`,
      user: JSON.stringify(
        {
          brief: input.brief,
          plan: input.plan,
          skills
        },
        null,
        2
      )
    });
  }
}
