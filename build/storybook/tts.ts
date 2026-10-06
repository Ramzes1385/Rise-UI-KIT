/**
 * Dev-middleware Storybook `POST /__rise/tts` для истории `SpeechYandex`: озвучка текста через Яндекс SpeechKit (REST v1).
 * Тот же код, что пример посредника в docs/reference/COMPONENTS.md (BasePresentationPlayer, «Озвучка через сервис»).
 * Ключ — `YANDEX_SPEECHKIT_API_KEY` из `.env.local`: читается здесь, на сервере, и в бандл не попадает (у переменных
 * `STORYBOOK_*` всё наоборот — Storybook отдаёт их клиенту). Только dev-сервер: в собранном Storybook адреса нет,
 * история уходит на синтез речи браузера.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin } from 'vite'

const STORYBOOK_TTS_PATH = '/__rise/tts'

const SPEECHKIT_URL = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'

/** v1 принимает до 5000 символов */
const MAX_TEXT_LENGTH = 5000

/** Язык кита → язык SpeechKit */
const SPEECHKIT_LANGS: Record<string, string> = { ru: 'ru-RU', en: 'en-US' }

const CONTENT_TYPES: Record<string, string> = { mp3: 'audio/mpeg', oggopus: 'audio/ogg', lpcm: 'audio/L16' }

interface TtsBody {
	text?: string
	voice?: string
	lang?: string
	format?: string
}

async function readJson(req: IncomingMessage): Promise<TtsBody> {
	let raw = ''
	for await (const chunk of req) raw += chunk
	return raw ? (JSON.parse(raw) as TtsBody) : {}
}

function errorStatus(error: unknown): number {
	if (error instanceof SyntaxError) return 400
	return error instanceof TypeError ? 502 : 500
}

function end(res: ServerResponse, status: number, message = ''): void {
	res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
	res.end(message)
}

async function synthesize(key: string, body: TtsBody, res: ServerResponse): Promise<void> {
	const text = body.text?.trim() ?? ''
	if (!text || text.length > MAX_TEXT_LENGTH) return end(res, 400, 'text: 1–5000 символов')
	const format = body.format ?? 'mp3'
	const upstream = await fetch(SPEECHKIT_URL, {
		method: 'POST',
		headers: { Authorization: `Api-Key ${key}` },
		body: new URLSearchParams({
			text,
			lang: SPEECHKIT_LANGS[body.lang ?? 'ru'] ?? body.lang ?? 'ru-RU',
			voice: body.voice ?? 'filipp',
			format,
		}),
	})
	if (!upstream.ok) return end(res, 502, `SpeechKit ${upstream.status}: ${await upstream.text()}`)
	res.writeHead(200, { 'Content-Type': CONTENT_TYPES[format] ?? 'application/octet-stream', 'Cache-Control': 'private, max-age=86400' })
	res.end(Buffer.from(await upstream.arrayBuffer()))
}

/** Плагин Vite только для dev-сервера Storybook: ключ читается один раз при старте */
export function createTtsPlugin(root: string): Plugin {
	return {
		name: 'rise:storybook-tts',
		apply: 'serve',
		configureServer(server) {
			const key = loadEnv(server.config.mode, root, 'YANDEX_SPEECHKIT_').YANDEX_SPEECHKIT_API_KEY ?? ''
			server.middlewares.use(STORYBOOK_TTS_PATH, (req, res) => {
				if (req.method !== 'POST') return end(res, 405, 'POST only')
				if (!key) return end(res, 503, 'Нет ключа: YANDEX_SPEECHKIT_API_KEY в .env.local')
				readJson(req)
					.then(body => synthesize(key, body, res))
					.catch((error: unknown) => end(res, errorStatus(error), error instanceof Error ? error.message : String(error)))
			})
		},
	}
}
