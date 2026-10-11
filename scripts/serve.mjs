/**
 * 零依赖静态服务器：服务项目根目录，便于以 http 打开示例页
 * （ES 模块导入不能走 file://，故需本地服务器）。
 * 用法：node scripts/serve.mjs  或  npm run example
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'

const root = process.cwd()
const PORT = process.env.PORT || 5173
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (p === '/') p = '/example/index.html'
    const file = normalize(join(root, p))
    if (!file.startsWith(root + sep)) {
      res.writeHead(403).end('forbidden')
      return
    }
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found')
  }
})

server.listen(PORT, () => {
  console.log(`\n  示例已启动：  http://localhost:${PORT}/example/index.html\n`)
})
