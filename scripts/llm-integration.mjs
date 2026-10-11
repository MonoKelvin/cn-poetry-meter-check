/**
 * 真实大模型联调脚本（需 cpmc.apis.json 与网络）。
 * 用法：npm run build && node scripts/llm-integration.mjs
 */
import {
  loadLlmConfigs,
  pickLlmConfig,
  loadSkillText,
  createAdvancedChecker,
  createRecommender,
} from '../dist/index.js'

const file = await loadLlmConfigs('cpmc.apis.json')
const cfg = pickLlmConfig(file)
console.log('使用配置：', cfg.name, '|', cfg.provider, '|', cfg.model)

const duizhangSkill = await loadSkillText('detect-duizhang')
const adv = createAdvancedChecker({ ai: cfg, duizhangSkill })
console.log('\n[LLM 对仗检测] 两个黄鹂鸣翠柳 / 一行白鹭上青天')
console.log(JSON.stringify(await adv.duizhang.check('两个黄鹂鸣翠柳', '一行白鹭上青天'), null, 2))

const composeSkill = await loadSkillText('compose-poem')
const rec = createRecommender({ ai: cfg, skills: { 'compose-poem': composeSkill } })
console.log('\n[LLM 自动成诗] 五绝 · 秋山行旅 · 平水韵十一尤')
console.log(
  JSON.stringify(
    await rec.composePoem({ form: 'wujue', theme: '秋山行旅', rhyme: '平水韵 下平十一尤' }),
    null,
    2,
  ),
)
