import { MEDIA_CAPTION_PRESETS } from '../types/MediaSubtitles.types'
import type { MediaCue, MediaCueSegment, MediaCaptionPoint, MediaCaptionPreset } from '../types/MediaSubtitles.types'

const TIMESTAMP = /(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/

const TIMING_LINE = /^\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})/

const TAG = /<(\/?)([ibu])(?:\.[^>]*)?>|<[^>]*>|\{\\[^}]*\}/gi

const ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&nbsp;': '\u00A0',
	'&lrm;': '\u200E',
	'&rlm;': '\u200F',
}

const BYTE_ORDER_MARKS: Array<[number[], string]> = [
	[[0xff, 0xfe], 'utf-16le'],
	[[0xfe, 0xff], 'utf-16be'],
]

const STYLE_BY_TAG: Record<string, keyof Omit<MediaCueSegment, 'text'>> = { i: 'isItalic', b: 'isBold', u: 'isUnderline' }

function toSeconds(value: string): number {
	const [, hours = '0', minutes, seconds, fraction] = TIMESTAMP.exec(value) as RegExpExecArray
	return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(fraction.padEnd(3, '0')) / 1000
}

function parseBlock(block: string): MediaCue | null {
	const lines = block.split('\n')
	const timingIndex = lines.findIndex(line => TIMING_LINE.test(line))
	const text = lines
		.slice(timingIndex + 1)
		.join('\n')
		.trim()
	if (timingIndex === -1 || !text) return null
	const [, start, end] = TIMING_LINE.exec(lines[timingIndex]) as RegExpExecArray
	return { start: toSeconds(start), end: toSeconds(end), text }
}

export function parseSubtitles(source: string): MediaCue[] {
	return source
		.replace(/^\uFEFF/, '')
		.replace(/\r\n?/g, '\n')
		.split(/\n[^\S\n]*\n/)
		.map(parseBlock)
		.filter((cue): cue is MediaCue => cue !== null)
		.sort((a, b) => a.start - b.start)
}

export function decodeSubtitles(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	const encoding = BYTE_ORDER_MARKS.find(([mark]) => mark.every((byte, index) => bytes[index] === byte))?.[1]
	if (encoding) return new TextDecoder(encoding).decode(bytes)
	const text = new TextDecoder().decode(bytes)
	return text.includes('\uFFFD') ? new TextDecoder('windows-1251').decode(bytes) : text
}

function decode(text: string): string {
	return text.replace(/&(amp|lt|gt|nbsp|lrm|rlm);/g, entity => ENTITIES[entity])
}

function lineSegments(line: string): MediaCueSegment[] {
	const segments: MediaCueSegment[] = []
	const style = { isItalic: false, isBold: false, isUnderline: false }
	const push = (text: string): void => {
		if (text) segments.push({ text: decode(text), ...style })
	}
	let last = 0
	for (const match of line.matchAll(TAG)) {
		push(line.slice(last, match.index))
		if (match[2]) style[STYLE_BY_TAG[match[2].toLowerCase()]] = !match[1]
		last = match.index + match[0].length
	}
	push(line.slice(last))
	return segments
}

export function cueLines(text: string): MediaCueSegment[][] {
	return text
		.split('\n')
		.map(lineSegments)
		.filter(segments => segments.some(segment => segment.text.trim()))
}

export function activeCueText(cues: MediaCue[], time: number): string {
	return cues
		.filter(cue => cue.start <= time && time < cue.end)
		.map(cue => cue.text)
		.join('\n')
}

export function isSubtitleFile(name: string): boolean {
	return /\.(srt|vtt)$/i.test(name)
}

export function captionPreset(position: MediaCaptionPoint): MediaCaptionPreset | null {
	const presets = Object.entries(MEDIA_CAPTION_PRESETS) as Array<[MediaCaptionPreset, MediaCaptionPoint]>
	return presets.find(([, point]) => point.x === position.x && point.y === position.y)?.[0] ?? null
}
