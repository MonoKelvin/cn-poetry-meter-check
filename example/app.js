import { checkMeter, createAdvancedChecker } from '../dist/index.js'

// 模块已成功加载：撤销 index.html 里的兜底提示
window.__cpmcLoaded = true

const $ = (s) => document.querySelector(s)
const RANK = { error: 3, warning: 2, info: 1 }
const ISSUE_ICON = { error: 'ti-alert-circle', warning: 'ti-alert-triangle', info: 'ti-info-circle' }
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function issueMap(issues) {
  const m = new Map()
  for (const i of issues) {
    if (!i.position) continue
    const k = i.position.lineIndex + ':' + i.position.charIndex
    if (!m.has(k) || RANK[i.level] > RANK[m.get(k)]) m.set(k, i.level)
  }
  return m
}

function poemHTML(result) {
  if (!result.lines) return ''
  const im = issueMap(result.issues)
  let i = 0
  const cellsOf = (line) =>
    line.cells
      .map((c, j) => {
        const lvl = im.get(line.lineIndex + ':' + j)
        const mark = lvl === 'error' || lvl === 'warning' ? 'bad' : lvl === 'info' ? 'amb' : ''
        const cls = ['gz', c.isRhyme ? 'is-rhyme' : '', mark].filter(Boolean).join(' ')
        return `<span class="${cls}" style="--i:${i++}"><i class="mk mk-${c.tone}"></i><span class="ch">${esc(c.char)}</span></span>`
      })
      .join('')
  const pct = (ch) => `<span class="pct">${ch}</span>`
  const lines = result.lines
  const rows = []
  for (let k = 0; k < lines.length; k += 2) {
    let row = cellsOf(lines[k])
    row += k + 1 < lines.length ? pct('，') + cellsOf(lines[k + 1]) + pct('。') : pct('。')
    rows.push(`<div class="p-line">${row}</div>`)
  }
  return `<div class="poem">${rows.join('')}</div>`
}

function summaryHTML(result) {
  if (!result.form) {
    return `<div class="summary"><span class="verdict no"><i class="ti ti-alert-triangle"></i>未识别诗体</span></div>`
  }
  const v = result.form.variant
  const variant = (v.start === 'level' ? '平起' : '仄起') + '，' + (v.firstLineRhymes ? '首句入韵' : '首句不入韵')
  const verdict = result.passed
    ? `<span class="verdict"><i class="ti ti-circle-check"></i>合律</span>`
    : `<span class="verdict no"><i class="ti ti-alert-triangle"></i>出律 ${result.stats.errors}</span>`
  const rhyme = result.inferredRhymeGroup ? `<span class="rhyme">押 ${esc(result.inferredRhymeGroup)}</span>` : ''
  return `<div class="summary">${verdict}<span>${esc(result.form.name)}，${variant}</span>${rhyme}</div>`
}

function issuesHTML(issues) {
  if (!issues.length) return `<p class="ok-note"><i class="ti ti-circle-check"></i>未发现问题。</p>`
  return (
    `<ul class="issues">` +
    issues
      .map(
        (i) =>
          `<li class="issue ${i.level}"><i class="ti ${ISSUE_ICON[i.level] || 'ti-point'}"></i><span>${esc(i.message)}</span></li>`,
      )
      .join('') +
    `</ul>`
  )
}

const EMPTY_HINT = `<p class="result-empty"><i class="ti ti-sparkles"></i>输入近体诗，即时呈现平仄与格律。</p>`

function runDemo() {
  updateCount()
  const text = $('#poem').value.trim()
  const out = $('#result')
  if (!text) {
    out.innerHTML = EMPTY_HINT
    return
  }
  try {
    const r = checkMeter(text, { rhymeBook: $('#rhymeBook').value, strictness: $('#strictness').value })
    out.innerHTML = summaryHTML(r) + poemHTML(r) + issuesHTML(r.issues)
  } catch (e) {
    out.innerHTML = `<p class="ok-note"><i class="ti ti-alert-circle"></i>出错：${esc(e && e.message ? e.message : e)}</p>`
  }
}

const debounce = (fn, ms) => {
  let t
  return () => {
    clearTimeout(t)
    t = setTimeout(fn, ms)
  }
}
const liveCheck = debounce(runDemo, 180)

const poemCount = $('#poemCount')
function updateCount() {
  const n = ($('#poem').value.match(/[㐀-鿿]/g) || []).length
  poemCount.textContent = n + ' 字'
}

$('#poem').addEventListener('input', () => {
  updateCount()
  liveCheck()
})
$('#rhymeBook').addEventListener('change', runDemo)
$('#strictness').addEventListener('change', runDemo)
$('#check').addEventListener('click', runDemo)

updateCount()
runDemo()

const heuristic = createAdvancedChecker()
$('#dzCheck').addEventListener('click', async () => {
  const chu = $('#chu').value.trim()
  const dui = $('#dui').value.trim()
  const out = $('#dzResult')
  if (!chu || !dui) {
    out.textContent = '请输入出句与对句。'
    return
  }
  try {
    const r = await heuristic.duizhang.check(chu, dui)
    const label = r.isParallel === null ? '未判定' : r.isParallel ? '合对仗' : '不合对仗'
    const icon = r.isParallel === null ? 'ti-help-circle' : r.isParallel ? 'ti-circle-check' : 'ti-alert-triangle'
    const cls = r.isParallel === false ? 'verdict no' : 'verdict'
    out.innerHTML =
      `<p class="dz-head"><span class="${cls}"><i class="ti ${icon}"></i>${label}</span><span class="dz-conf">可信度 ${Math.round(r.confidence * 100)}%</span></p>` +
      (r.issues.length ? '<ul>' + r.issues.map((i) => `<li>${esc(i.reason)}</li>`).join('') + '</ul>' : '') +
      (r.notes.length ? `<p class="dz-note">${r.notes.map(esc).join('；')}</p>` : '')
  } catch (e) {
    out.innerHTML = `出错：${esc(e && e.message ? e.message : e)}`
  }
})
