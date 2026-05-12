import path from "node:path";
import { OpenAICompatibleClient } from "../llm/OpenAICompatibleClient.js";
import { SkillRegistry } from "../skills/SkillRegistry.js";
import { DesignerAgent } from "../agents/DesignerAgent.js";
import { ContentAgent } from "../agents/ContentAgent.js";
import { PlannerAgent } from "../agents/PlannerAgent.js";
import { ReviewerAgent } from "../agents/ReviewerAgent.js";
import { ValidatorAgent } from "../agents/ValidatorAgent.js";
import { VueCoderAgent } from "../agents/VueCoderAgent.js";
import { WriterAgent } from "../agents/WriterAgent.js";

export class MultiAgentOrchestrator {
  constructor({ config, onEvent } = {}) {
    if (!config) {
      throw new Error("MultiAgentOrchestrator requires config.");
    }

    this.config = config;
    this.onEvent = onEvent;
    this.skillRegistry = new SkillRegistry({
      skillsDir: path.join(config.projectRoot, "skills")
    });
    this.llm = new OpenAICompatibleClient(config);
  }

  emit(event) {
    this.onEvent?.({
      at: new Date().toISOString(),
      ...event
    });
  }

  async initialize() {
    const skills = await this.skillRegistry.load();
    this.emit({
      agent: "SkillRegistry",
      status: "ready",
      message: `已加载 ${skills.length} 个技能`
    });
  }

  createAgents() {
    const base = {
      llm: this.llm,
      skillRegistry: this.skillRegistry
    };

    return {
      planner: new PlannerAgent({ ...base, name: "PlannerAgent" }),
      designer: new DesignerAgent({ ...base, name: "DesignerAgent" }),
      content: new ContentAgent({ ...base, name: "ContentAgent" }),
      coder: new VueCoderAgent({ ...base, name: "VueCoderAgent" }),
      reviewer: new ReviewerAgent({ ...base, name: "ReviewerAgent" }),
      validator: new ValidatorAgent({ ...base, name: "ValidatorAgent" }),
      writer: new WriterAgent({ ...base, name: "WriterAgent" })
    };
  }

  async generateVueSite({ name, brief, outDir = "generated-sites", skillIds = [], dryRun = false }) {
    await this.initialize();
    const agents = this.createAgents();
    const context = {
      config: this.config,
      skillIds,
      emit: (event) => this.emit(event)
    };

    this.emit({
      agent: "Orchestrator",
      status: "started",
      message: this.config.offline ? "使用离线模式生成 Vue 网站" : "使用大模型 API 生成 Vue 网站"
    });

    const plan = await agents.planner.run({ name, brief }, context);
    const design = await agents.designer.run({ name, brief, plan }, context);
    const content = await agents.content.run({ name, brief, plan, design }, context);
    let code = await agents.coder.run({ name, brief, plan, design, content }, context);
    const review = await agents.reviewer.run({ brief, plan, design, content, code }, context);

    if (review.status === "changes_requested") {
      code = await agents.coder.revise(
        {
          brief,
          plan,
          design,
          content,
          currentCode: code,
          review
        },
        context
      );
    }

    const validation = await agents.validator.run({ code }, context);
    if (validation.status !== "passed") {
      throw new Error(`Validation failed:\n${validation.errors.join("\n")}`);
    }

    const report = {
      generatedAt: new Date().toISOString(),
      mode: this.config.offline ? "offline" : "api",
      model: this.config.offline ? "offline" : this.config.model,
      name,
      brief,
      plan,
      design,
      content,
      review,
      validation,
      implementationNotes: code.implementationNotes || []
    };

    const writeResult = await agents.writer.run({
      name,
      outDir,
      code,
      report,
      dryRun
    }, context);

    this.emit({
      agent: "Orchestrator",
      status: "done",
      message: dryRun ? "Vue 网站工程已完成预演" : "Vue 网站工程已生成"
    });

    return {
      ...writeResult,
      plan,
      design,
      content,
      review,
      validation,
      dryRun
    };
  }
}
