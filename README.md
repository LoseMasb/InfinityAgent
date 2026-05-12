# Infinity Vue Agent

一个只在当前工作区运行的多 Agent Vue 网站生成工程。它把“需求理解、信息架构、视觉规范、Vue 代码生成、审查、静态校验、写入文件”拆成多个协作角色，并可接入 OpenAI 兼容的 `/chat/completions` 大模型 API。

## 能做什么

- 读取 `skills/` 里的技能说明，作为 Agent 工作规范。
- 用 Planner、Designer、Content、Vue Coder、Reviewer、Validator、Writer 协同生成 Vue/Vite 网站。
- 支持离线演示模式，不配置 API key 也能生成一个示例站点。
- 默认把生成结果写入当前目录下的 `generated-sites/<name>/`。
- 对所有写入路径做当前目录边界校验，避免越界写文件。
- 支持 `--skills` 选择技能上下文，也支持 `--dry-run` 预演整个流程。

## 快速开始

查看命令：

```bash
node cli.js --help
```

离线生成示例：

```bash
node cli.js generate --offline --name demo-vue-site --brief-file examples/briefs/landing.zh.md
```

接入大模型 API：

```bash
cp .env.example .env
```

把 `.env` 里的 `LLM_API_KEY`、`LLM_API_BASE_URL`、`LLM_MODEL` 换成你的服务商配置，然后运行：

```bash
LLM_API_KEY=sk-xxx LLM_MODEL=gpt-4.1-mini node cli.js generate --name brand-site --brief "做一个面向 AI 设计工作室的 Vue 官网，强调作品集、服务流程和联系转化。"
```

CLI 会自动读取当前目录的 `.env`，所以也可以直接运行：

```bash
node cli.js generate --name brand-site --brief "做一个面向 AI 设计工作室的 Vue 官网，强调作品集、服务流程和联系转化。"
```

生成后进入站点目录安装依赖并启动：

```bash
cd generated-sites/brand-site
npm install
npm run dev
```

预演一次，不写文件：

```bash
node cli.js generate --dry-run --skills vue-website-maker,content-strategy --brief "做一个强调转化的品牌站。"
```

如果没有配置 API key，`--dry-run` 会自动切换到离线模式。

## 结构

```text
cli.js                         CLI 入口
src/config.js                  API 和运行配置
src/llm/OpenAICompatibleClient.js
src/orchestrator/MultiAgentOrchestrator.js
src/agents/                    多 Agent 角色
src/skills/SkillRegistry.js    技能加载器
src/utils/                     JSON、路径、slug 工具
src/data/                      生成站点的数据模块
skills/                        可编辑技能
examples/briefs/               示例需求
generated-sites/               默认生成输出
```

## Agent 流程

1. `PlannerAgent` 把 brief 拆成目标、用户、页面结构和验收标准。
2. `DesignerAgent` 产出视觉方向、设计 token、响应式规则和交互建议。
3. `ContentAgent` 产出首屏文案、SEO 和结构化内容。
4. `VueCoderAgent` 生成 Vite + Vue 3 项目文件。
5. `ReviewerAgent` 从产品、可用性和代码完整度角度审查。
6. `ValidatorAgent` 做本地静态校验，检查必需文件和路径安全。
7. `WriterAgent` 把通过校验的文件写入当前工作区内。

## 技能

技能是普通 Markdown 文件，放在 `skills/` 里即可。运行下面命令查看当前技能：

```bash
node cli.js skills
```

新增技能时，建议写清楚：

- 适用场景
- 设计或代码约束
- 输出标准
- 常见错误

内置技能包括 `vue-website-maker`、`design-system`、`multi-agent-collaboration`、`quality-review`、`content-strategy` 和 `vue-data-driven-pages`。

Agent 会在每次生成时把这些技能作为上下文注入给大模型。
# InfinityAgent
