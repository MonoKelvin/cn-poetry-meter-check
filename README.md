# cn-poetry-meter-check (CPMC)

中国古典诗词（近体诗）格律检测算法库。全称 cn-poetry-meter-check，缩写 CPMC（cn 指 Chinese）。

> v1.0.0 开发中。完整的调研、业务需求、设计开发文档见 `docs/`。

## 功能（v1.0.0）

- **基础检测**（纯算法、离线）：平仄、押韵、替/粘/对、孤平、三平调/三仄尾、拗句、拗救、多音字歧义。
- **多韵表**：平水韵（默认，含入声）、词林正韵、中华新韵、中华通韵，可切换。
- **高级检测**（对仗、多音字消歧）与**推荐**：预留稳定 API，可接入大模型（OpenAI 兼容 / Anthropic）。

## 安装

```bash
npm i cn-poetry-meter-check
```

## 快速使用

```ts
import { checkMeter } from 'cn-poetry-meter-check'

const result = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。')
console.log(result.passed, result.issues)
```

## 高级检测与推荐（可选大模型）

对仗、多音字消歧与各类推荐可接入大模型（OpenAI 兼容 / Anthropic Claude）。将各家 API 写入本地 `cpmc.apis.json`（含密钥，已 `.gitignore`，模板见 `cpmc.apis.example.json`，支持多套）：

```ts
import { loadLlmConfigs, pickLlmConfig, createAdvancedChecker, loadSkillText } from 'cn-poetry-meter-check'

const cfg = pickLlmConfig(await loadLlmConfigs()) // 读取 cpmc.apis.json
const adv = createAdvancedChecker({ ai: cfg, duizhangSkill: await loadSkillText('detect-duizhang') })
await adv.duizhang.check('两个黄鹂鸣翠柳', '一行白鹭上青天')
```

对仗启发式检测（等长 + 平仄相对）无需大模型即可用：`createAdvancedChecker().duizhang.check(...)`。

## 文档

见 `docs/` 目录：调研、业务需求、设计开发、API 使用文档。

## 许可

本项目 MIT。内置韵表数据来自 [charlesix59/chinese_word_rhyme](https://github.com/charlesix59/chinese_word_rhyme)（MIT），版权声明见 `data/` 目录。
