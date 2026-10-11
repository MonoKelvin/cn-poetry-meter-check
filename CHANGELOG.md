# 更新日志

本项目遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-10-11

首个版本。

### 新增
- **基础检测**（纯算法、离线）：诗体识别（五/七言绝句·律诗及平起/仄起、首句入韵变体）、平仄、押韵（落韵/重韵/当押未押）、替/粘/对、孤平、三平调/三仄尾、拗救与特拗（变格）、多音字歧义提示；平水韵以广韵平仄兜底，未录字给“韵书未录”提示。
- **多韵表**：平水韵（默认）、词林正韵、中华新韵、中华通韵（今音，pinyin-pro 映射 16 韵）。
- **高级检测**：对仗（启发式 + LLM，可选 jieba 词性）、多音字消歧（LLM）。
- **推荐**（LLM）：出律补救、对仗替换、成诗、补句、填字、字眼。
- **通用 AI**：OpenAI 兼容客户端（Qwen/DeepSeek/Kimi/OpenAI）+ Anthropic 适配；SKILL 装载、结构化输出（Zod 校验与重试）。
- **门面 API**：`checkMeter` / `PoetryChecker` / `createAdvancedChecker` / `createRecommender` / `checkMeterResolved`。
- 示例页（逐字平仄着色）、SKILL.md 文档集（检测/推荐）、中文文档（调研/业务/设计/API）、GitHub Actions CI。
