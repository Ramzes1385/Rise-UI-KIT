/** Утилиты субтитров: разбор WebVTT и SubRip, определение кодировки файла, запись реплик в .vtt и .srt */
import type { SubtitleCue, SubtitleFormat } from './types/subtitleUtils.types'

const TIMESTAMP = /(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/

const TIMING_LINE = /^\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})/

const BYTE_ORDER_MARKS: Array<[number[], string]> = [
	[[0xff, 0xfe], 'utf-16le'],
	[[0xfe, 0xff], 'utf-16be'],
]

function toSeconds(value: string): number {
	const [, hours = '0', minutes, seconds, fraction] = TIMESTAMP.exec(value) as RegExpExecArray
	return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(fraction.padEnd(3, '0')) / 1000
}

function parseBlock(block: string): SubtitleCue | null {
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

/** Реплики из текста WebVTT (.vtt) или SubRip (.srt): заголовки, NOTE, STYLE и настройки реплик пропускаются, порядок — по началу */
export function parseSubtitles(source: string): SubtitleCue[] {
	return source
		.replace(/^\uFEFF/, '')
		.replace(/\r\n?/g, '\n')
		.split(/\n[^\S\n]*\n/)
		.map(parseBlock)
		.filter((cue): cue is SubtitleCue => cue !== null)
		.sort((a, b) => a.start - b.start)
}

/** Текст файла субтитров: UTF-16 по BOM, иначе UTF-8, а если он не читается — Windows-1251 */
export function decodeSubtitles(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	const encoding = BYTE_ORDER_MARKS.find(([mark]) => mark.every((byte, index) => bytes[index] === byte))?.[1]
	if (encoding) return new TextDecoder(encoding).decode(bytes)
	const text = new TextDecoder().decode(bytes)
	return text.includes('\uFFFD') ? new TextDecoder('windows-1251').decode(bytes) : text
}

function pad(value: number, length = 2): string {
	return String(value).padStart(length, '0')
}

/** Время реплики в формате файла: `00:01:02.500` (vtt) или `00:01:02,500` (srt) */
export function formatSubtitleTime(seconds: number, format: SubtitleFormat = 'vtt'): string {
	const total = Math.round(Math.max(seconds, 0) * 1000)
	const [hours, minutes, rest, millis] = [
		Math.floor(total / 3_600_000),
		Math.floor(total / 60_000) % 60,
		Math.floor(total / 1000) % 60,
		total % 1000,
	]
	return `${pad(hours)}:${pad(minutes)}:${pad(rest)}${format === 'srt' ? ',' : '.'}${pad(millis, 3)}`
}

/** Реплики в текст файла .vtt или .srt; реплики идут по времени начала */
export function serializeSubtitles(cues: SubtitleCue[], format: SubtitleFormat = 'vtt'): string {
	const blocks = [...cues]
		.sort((a, b) => a.start - b.start)
		.map((cue, index) => {
			const timing = `${formatSubtitleTime(cue.start, format)} --> ${formatSubtitleTime(cue.end, format)}`
			return format === 'srt' ? `${index + 1}\n${timing}\n${cue.text}` : `${timing}\n${cue.text}`
		})
	return `${format === 'vtt' ? 'WEBVTT\n\n' : ''}${blocks.join('\n\n')}\n`
}
