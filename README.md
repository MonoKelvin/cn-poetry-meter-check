# cn-poetry-meter-check (CPMC)

中国古典诗词（近体诗）格律检测算法库。纯算法基础检测可离线运行；对仗、多音字消歧与推荐可选接入大模型。

## 特性

- **基础检测（纯算法、离线、零网络）**：诗体识别（五/七言绝句·律诗）、平仄、押韵（落韵/重韵/当押未押）、替/粘/对、孤平、三平调/三仄尾、拗救与特拗（变格）、多音字歧义提示。
- **多韵表可切换**：平水韵（默认，中古音含入声；广韵平仄兜底、未录提示）、词林正韵、中华新韵、中华通韵（今音，pinyin-pro 映射）。
- **高级检测**：对仗（启发式免联网 + 大模型 SKILL 判工对/合掌）、多音字消歧（大模型）。
- **推荐（大模型）**：出律补救、对仗替换、成诗、补句、填字、字眼。
- **通用 AI**：一套 OpenAI 兼容客户端（Qwen/DeepSeek/Kimi/OpenAI）+ Anthropic 适配；SKILL 装载与结构化输出（Zod 校验）。
- TypeScript，产出 ESM + CJS + d.ts。

## 安装

```bash
npm i cn-poetry-meter-check
```

## 快速开始（基础检测）

```ts
import { checkMeter } from 'cn-poetry-meter-check'

const r = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。')
r.form?.name          // '五言绝句'
r.form?.variant       // { start: 'oblique', firstLineRhymes: false }
r.inferredRhymeGroup  // '十一尤'
r.passed              // true
r.issues              // 逐项问题（级别 / 类别 / 位置 / 中文说明）
r.lines               // 逐字平仄（含应有平仄与韵脚标记，便于可视化）
```

可配置韵表与严格度：

```ts
import { PoetryChecker } from 'cn-poetry-meter-check'
new PoetryChecker({ rhymeBook: 'xinyun', strictness: 'normal' }).check('……')
```

## 韵表

`rhymeBook`：`'pingshui'`（默认）/ `'cilin'` / `'xinyun'` / `'tongyun'`。
中华通韵依今音，需可选依赖 `pinyin-pro`，先注册再用：

```ts
import { createTongyunRhymeTable, registerRhymeTable, checkMeter } from 'cn-poetry-meter-check'
registerRhymeTable(await createTongyunRhymeTable())
checkMeter(poem, { rhymeBook: 'tongyun' })
```

## 高级检测与推荐（可选大模型）

将各家 API 写入本地 `cpmc.apis.json`（含密钥，**已 .gitignore，勿提交**；模板见 `cpmc.apis.example.json`，支持多套）：

```ts
import {
  loadLlmConfigs, pickLlmConfig, createAdvancedChecker, createRecommender, loadSkillText,
} from 'cn-poetry-meter-check'

const cfg = pickLlmConfig(await loadLlmConfigs())
const adv = createAdvancedChecker({ ai: cfg, duizhangSkill: await loadSkillText('detect-duizhang') })
await adv.duizhang.check('两个黄鹂鸣翠柳', '一行白鹭上青天') // 工对

const rec = createRecommender({ ai: cfg, skills: { 'compose-poem': await loadSkillText('compose-poem') } })
await rec.composePoem({ form: 'wujue', theme: '秋山', rhyme: '平水韵 下平十一尤' })
```

对仗启发式（等长 + 节奏点平仄相对，可选 jieba 词性）无需大模型：`createAdvancedChecker().duizhang.check(a, b)`。

## 开发

```bash
npm run example     # 构建并本地起服，打开演示页（推荐）
npm run build       # tsup → dist（ESM + CJS + d.ts）
npm test            # vitest
npm run typecheck   # tsc --noEmit
```

演示页用 ES 模块，须经本地服务器打开（不能 `file://` 直开）；`npm run example` 会自动构建并起服，终端打印访问地址。

## 文档

`docs/`：调研、业务需求、设计开发、API 使用文档（均中文）。

## 数据来源与许可

本项目 MIT。内置韵表数据：平水韵 / 词林正韵 / 中华新韵来自 [charlesix59/chinese_word_rhyme](https://github.com/charlesix59/chinese_word_rhyme)（MIT）；广韵平仄兜底表由 [LingDong-/cope](https://github.com/LingDong-/cope)（ISC）整理。详见 `data/SOURCES.txt`。
