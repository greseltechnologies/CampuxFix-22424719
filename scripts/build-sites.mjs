import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'

const outputDirectory = resolve('dist')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

async function collectFiles(directory) {
  const result = {}

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'server' || entry.name === '.openai') continue
    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      Object.assign(result, await collectFiles(fullPath))
      continue
    }

    const pathname = `/${relative(outputDirectory, fullPath).split(sep).join('/')}`
    result[pathname] = {
      body: (await readFile(fullPath)).toString('base64'),
      contentType: contentTypes[extname(entry.name).toLowerCase()] ?? 'application/octet-stream',
    }
  }

  return result
}

const files = await collectFiles(outputDirectory)
const worker = `const files = ${JSON.stringify(files)};

function decode(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0))
}

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const requested = url.pathname === '/' ? '/index.html' : url.pathname
    const entry = files[requested] || files['/index.html']
    const isAsset = requested.startsWith('/assets/')

    return new Response(decode(entry.body), {
      headers: {
        'Content-Type': entry.contentType,
        'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
  },
}
`

await mkdir(join(outputDirectory, 'server'), { recursive: true })
await mkdir(join(outputDirectory, '.openai'), { recursive: true })
await writeFile(join(outputDirectory, 'server', 'index.js'), worker)
await writeFile(
  join(outputDirectory, '.openai', 'hosting.json'),
  await readFile(resolve('.openai', 'hosting.json')),
)
