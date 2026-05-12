export class BaseAgent {
  constructor({ name, llm, skillRegistry }) {
    this.name = name;
    this.llm = llm;
    this.skillRegistry = skillRegistry;
  }

  emit(context, message, status = "working") {
    context.emit?.({
      agent: this.name,
      status,
      message
    });
  }

  selectedSkills(context, defaults = []) {
    const selected = Array.isArray(context?.skillIds) ? context.skillIds : [];
    return [...new Set([...defaults, ...selected])];
  }
}
