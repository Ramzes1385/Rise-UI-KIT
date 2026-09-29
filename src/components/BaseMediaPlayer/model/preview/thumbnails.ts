import { isSafeUrl } from '@utils/urlUtils'
import type { MediaThumbnailArea, MediaThumbnailCue } from '../../types/content/MediaPreview.types'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:']

const TIME = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*$/

const AREA = /^#xywh=(\d+),(\d+),(\d+),(\d+)$/

function parseTime(text: string): number | null {
	const match = TIME.exec(text)
	if (!match) return null
	const [, hours = '0', minutes, seconds, fraction] = match
	return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(fraction.padEnd(3, '0')) / 1000
}

function parseArea(hash: string): MediaThumbnailArea | undefined {
	const match = AREA.exec(hash)
	if (!match) return undefined
	const [x, y, width, height] = match.slice(1).map(Number)
	return width > 0 && height > 0 ? { x, y, width, height } : undefined
}

function parseCue(block: string, base: string): MediaThumbnailCue | null {
	const lines = block
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean)
	const index = lines.findIndex(line => line.includes('-->'))
	const target = lines[index + 1]
	if (index === -1 || !target) return null
	const [from, to] = lines[index].split('-->')
	const start = parseTime(from)
	const end = parseTime(to.split(/\s/).filter(Boolean)[0] ?? '')
	if (start === null || end === null) return null
	const url = new URL(target, base)
	const area = parseArea(url.hash)
	url.hash = ''
	return isSafeUrl(url.href, IMAGE_PROTOCOLS) ? { start, end, url: url.href, area } : null
}

export function parseThumbnails(text: string, base: string): MediaThumbnailCue[] {
	return text
		.split(/\r?\n\s*\r?\n/)
		.map(block => {
			try {
				return parseCue(block, base)
			} catch {
				return null
			}
		})
		.filter(cue => cue !== null)
}

export function thumbnailAt(cues: MediaThumbnailCue[], time: number): MediaThumbnailCue | null {
	return cues.find(cue => cue.start <= time && time < cue.end) ?? null
}
