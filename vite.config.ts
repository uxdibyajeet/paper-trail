import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function inline(v: unknown): string {
  if (v === null) return 'null'
  if (typeof v !== 'object') return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map((x) => inline(x)).join(', ')}]`
  return `{ ${Object.entries(v as Record<string, unknown>)
    .map(([k, val]) => `"${k}": ${inline(val)}`)
    .join(', ')} }`
}

function stringifyLayout(layout: unknown): string {
  const flat = (v: unknown): boolean => {
    if (v === null || typeof v !== 'object') return true
    if (Array.isArray(v)) return v.every((x) => x === null || typeof x !== 'object')
    return Object.values(v).every((x) => x === null || typeof x !== 'object')
  }
  const render = (v: unknown, indent: number): string => {
    if (flat(v)) return inline(v)
    const obj = v as Record<string, unknown>
    const pad = '  '.repeat(indent)
    const lines = Object.entries(obj).map(([k, val]) => `${pad}"${k}": ${render(val, indent + 1)}`)
    return `{\n${lines.join(',\n')}\n${pad.slice(0, 2 * (indent - 1))}}`
  }
  return render(layout, 1)
}

function layoutSavePlugin(): Plugin {
  const file = resolve(process.cwd(), 'src/data/layout.json')
  return {
    name: 'layout-save',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/__layout')) return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }
        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}') as { layout?: unknown }
            const layout = parsed?.layout
            if (!layout || typeof layout !== 'object') throw new Error('expected { layout: {...} }')
            writeFileSync(file, stringifyLayout(layout) + '\n', 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), layoutSavePlugin()],
})