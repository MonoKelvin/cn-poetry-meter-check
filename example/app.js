import { checkMeter, createAdvancedChecker } from '../dist/index.js'

const $ = (id) => document.getElementById(id)
const LEVEL_TEXT = { error: '错误', warning: '警告', info: '提示' }
const TONE_TEXT = { level: '平', oblique: '仄', either: '中', unknown: '录' }
const rank = (l) => (l === 'error' ? 3 : l === 'warning' ? 2 : 1)

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function issueMap(issues) {
  const m = new Map()
  for (const i of issues) {
    if (!i.position) continue
    const k = `${i.position.lineIndex}:${i.position.charIndex}`
    if (!m.has(k) || rank(i.level) > rank(m.get(k))) m.set(k, i.level)
  }
  return m
}

function renderCells(result) {
  if (!result.lines) return ''
  const im = issueMap(result.issues)
  const rows = result.lines
    .map((line) => {
      const cells = line.cells
        .map((c, j) => {
          const bad = im.get(`${line.lineIndex}:${j}`)
          const cls = ['cell', 'tone-' + c.tone, bad ? 'bad-' + bad : '', c.isRhyme ? 'rhyme' : '']
            .filter(Boolean)
            .join(' ')
          const exp =
            c.expected && c.expected !== c.tone ? `<span class="exp">${TONE_TEXT[c.expected] ?? ''}</span>` : ''
          const title = `实际${TONE_TEXT[c.tone]}${c.expected ? ' / 应' + TONE_TEXT[c.expected] : ''}`
          return `<span class="${cls}" title="${title}">${escapeHtml(c.char)}${exp}</span>`
        })
        .join('')
      return `<div class="line">${cells}</div>`
    })
    .join('')
  return `<div class="grid">${rows}</div>`
}

function issuesHtml(issues) {
  if (!issues.length) return '<p class="meta">未发现问题。</p>'
  return (
    '<ul class="issues">' +
    issues
      .map((i) => `<li class="issue ${i.level}"><span class="tag">${LEVEL_TEXT[i.level] ?? i.level}</span>${escapeHtml(i.message)}</li>`)
      .join('') +
    '</ul>'
  )
}

function renderResult(result) {
  const el = $('result')
  el.hidden = false
  let html = ''
  if (result.form) {
    const v = result.form.variant
    const variant = `${v.start === 'level' ? '平起' : '仄起'}·${v.firstLineRhymes ? '首句入韵' : '首句不入韵'}`
    html += result.passed
      ? `<p class="status pass">✓ 合律（${result.form.name}·${variant}）</p>`
      : `<p class="status fail">✗ 不合律（${result.form.name}·${variant}）</p>`
    if (result.inferredRhymeGroup) {
      html += `<p class="meta">所押韵部：${escapeHtml(result.inferredRhymeGroup)}（${result.rhymeBook}）</p>`
    }
  } else {
    html += '<p class="status fail">未能识别诗体（需 4 或 8 句、每句 5 或 7 字）</p>'
  }
  html += renderCells(result)
  html += `<p class="meta">错误 ${result.stats.errors} · 警告 ${result.stats.warnings} · 提示 ${result.stats.infos}</p>`
  html += issuesHtml(result.issues)
  el.innerHTML = html
}

$('check').addEventListener('click', () => {
  const text = $('poem').value.trim()
  if (!text) return
  try {
    renderResult(checkMeter(text, { rhymeBook: $('rhymeBook').value, strictness: $('strictness').value }))
  } catch (e) {
    const el = $('result')
    el.hidden = false
    el.innerHTML = `<p class="status fail">出错：${escapeHtml(e && e.message ? e.message : e)}</p>`
  }
})

async function loadDuizhangSkill() {
  try {
    const res = await fetch('../skills/detect-duizhang/SKILL.md')
    if (res.ok) return await res.text()
  } catch {
    /* ignore */
  }
  return undefined
}

$('aiCheck').addEventListener('click', async () => {
  const out = $('aiResult')
  const chu = $('chu').value.trim()
  const dui = $('dui').value.trim()
  if (!chu || !dui) {
    out.textContent = '请输入出句与对句。'
    return
  }
  out.textContent = '检测中……'
  const apiKey = $('apiKey').value.trim()
  const ai = apiKey
    ? { provider: $('provider').value, baseUrl: $('baseUrl').value.trim() || undefined, apiKey, model: $('model').value.trim() }
    : undefined
  try {
    const skill = ai ? await loadDuizhangSkill() : undefined
    const adv = createAdvancedChecker(ai && skill ? { ai, duizhangSkill: skill } : {})
    const r = await adv.duizhang.check(chu, dui)
    const verdict = r.isParallel === null ? '未判定' : r.isParallel ? '对仗' : '不对仗'
    out.innerHTML =
      `<p><b>${verdict}</b>（可信度 ${r.confidence}）${ai ? '' : '（启发式）'}</p>` +
      (r.issues.length ? '<ul>' + r.issues.map((i) => `<li>${escapeHtml(i.reason)}</li>`).join('') + '</ul>' : '') +
      (r.notes.length ? `<p class="meta">${r.notes.map(escapeHtml).join('；')}</p>` : '')
  } catch (e) {
    out.innerHTML = `<p class="status fail">出错：${escapeHtml(e && e.message ? e.message : e)}（浏览器直连可能受 CORS 限制）</p>`
  }
})
