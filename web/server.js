import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 5173
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
  const file = path.normalize(path.join(root, relative))
  if (!file.startsWith(root)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(port, () => {
  console.log(`English Chat School is running at http://localhost:${port}`)
})
