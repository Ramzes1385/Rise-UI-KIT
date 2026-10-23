/**
 * Статический сервер собранного Storybook для CI. Отдаёт части файлов по Range (206): без них браузер не перематывает видео и аудио.
 * Порт — `PORT` (по умолчанию 6006), папка сборки — `SB_DIR` (по умолчанию `storybook-static`). Без сборки — выход с подсказкой.
 */

import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const STATIC_DIR = process.env.SB_DIR ? resolve(process.env.SB_DIR) : join(__dirname, '..', 'storybook-static')
const PORT = Number(process.env.PORT) || 6006

if (!existsSync(join(STATIC_DIR, 'index.json'))) {
	console.error('Нет storybook-static: соберите Storybook (`npm run build-storybook`) или запустите `npm run test:e2e:dev`.')
	process.exit(1)
}

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.ico': 'image/x-icon',
	'.webm': 'video/webm',
	'.mp4': 'video/mp4',
	'.m4a': 'audio/mp4',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.opus': 'audio/ogg',
	'.vtt': 'text/vtt',
	'.srt': 'application/x-subrip',
	'.m3u8': 'application/vnd.apple.mpegurl',
}

function getMimeType(path) {
	const ext = extname(path)
	return MIME_TYPES[ext] || 'application/octet-stream'
}

/** Диапазон байтов из заголовка Range: `bytes=100-`, `bytes=100-199`, `bytes=-500` (последние 500 байт) */
function parseRange(header, size) {
	const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? '')
	if (!match || (!match[1] && !match[2])) return null
	const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))
	const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
	return start <= end && start < size ? { start, end } : 'invalid'
}

const server = createServer((req, res) => {
	if (!req.url) {
		res.writeHead(400)
		res.end('Bad Request')
		return
	}

	const { pathname } = new URL(req.url, 'http://localhost')

	const serveFile = async path => {
		try {
			const info = await stat(path)

			if (info.isDirectory()) {
				return serveFile(join(path, 'index.html'))
			}

			const headers = {
				'Content-Type': getMimeType(path),
				'Accept-Ranges': 'bytes',
				'Cache-Control': pathname.includes('.stories.') ? 'no-cache' : 'public, max-age=31536000',
			}
			const range = parseRange(req.headers.range, info.size)

			if (range === 'invalid') {
				res.writeHead(416, { 'Content-Range': `bytes */${info.size}` })
				res.end()
				return
			}

			if (range) {
				res.writeHead(206, {
					...headers,
					'Content-Range': `bytes ${range.start}-${range.end}/${info.size}`,
					'Content-Length': range.end - range.start + 1,
				})
				createReadStream(path, range).pipe(res)
				return
			}

			res.writeHead(200, { ...headers, 'Content-Length': info.size })
			createReadStream(path).pipe(res)
		} catch {
			res.writeHead(404)
			res.end('Not Found')
		}
	}

	serveFile(join(STATIC_DIR, pathname))
})

server.listen(PORT, () => {
	console.log(`Storybook static server running at http://localhost:${PORT}`)
})
