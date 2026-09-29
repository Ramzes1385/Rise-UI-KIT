import { MEDIA_CAPTION_PRESETS } from '../types/MediaSubtitles.types'
import type { MediaCue, MediaCueSegment, MediaCaptionPoint, MediaCaptionPreset } from '../types/MediaSubtitles.types'

const TAG = /<(\/?)([ibu])(?:\.[^>]*)?>|<[^>]*>|\{\\[^}]*\}/gi

const ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&nbsp;': '\u00A0',
	'&lrm;': '\u200E',
	'&rlm;': '\u200F',
}

const STYLE_BY_TAG: Record<string, keyof Omit<MediaCueSegment, 'text'>> = { i: 'isItalic', b: 'isBold', u: 'isUnderline' }

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
