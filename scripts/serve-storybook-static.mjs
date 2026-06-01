import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const STATIC_DIR = join(__dirname, '..', 'storybook-static')
const PORT = 6006

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.ico': 'image/x-icon',
}

function getMimeType(path) {
	const ext = extname(path)
	return MIME_TYPES[ext] || 'application/octet-stream'
}

const server = createServer((req, res) => {
	if (!req.url) {
		res.writeHead(400)
		res.end('Bad Request')
		return
	}

	const { pathname } = new URL(req.url, 'http://localhost')

	const serveFile = async (path, isBinary = false) => {
		try {
			const stat = await import('node:fs').then(fs => fs.promises.stat(path))

			if (stat.isDirectory()) {
				const indexPath = join(path, 'index.html')
				return serveFile(indexPath)
			}

			const mimeType = getMimeType(path)
			res.writeHead(200, {
				'Content-Type': mimeType,
				'Cache-Control': pathname.includes('.stories.') ? 'no-cache' : 'public, max-age=31536000',
			})

			const stream = createReadStream(path)
			stream.pipe(res)
		} catch {
			res.writeHead(404)
			res.end('Not Found')
		}
	}

	const filePath = join(STATIC_DIR, pathname)
	serveFile(filePath)
})

server.listen(PORT, () => {
	console.log(`Storybook static server running at http://localhost:${PORT}`)
})