import { formatMediaTime } from '@utils/media/mediaUtils'
import type { SubtitleCue } from '@utils/media/subtitleUtils'
import { highlightSearchMatches } from '@utils/data/textUtils'
import type { AudioTranscriptCue, AudioTranscriptPart } from '../../types/AudioTranscript.types'

const VOICE = /^\s*<v(?:\.[^\s>]*)?\s+([^>]+)>/

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"', lrm: '‎', rlm: '‏' }

function plainText(text: string): string {
	return text
		.replace(/<[^>]*>/g, '')
		.replace(/&(amp|lt|gt|nbsp|quot|lrm|rlm);/g, (_, name: string) => ENTITIES[name])
		.replace(/\s*\n\s*/g, ' ')
		.trim()
}

export function isTranscriptText(source: string): boolean {
	return source.includes('-->')
}

export function toTranscriptCues(cues: SubtitleCue[]): AudioTranscriptCue[] {
	return cues.map((cue, index) => ({
		index,
		start: cue.start,
		end: cue.end,
		speaker: plainText(VOICE.exec(cue.text)?.[1] ?? ''),
		text: plainText(cue.text),
	}))
}

export function findCueIndex(cues: AudioTranscriptCue[], time: number): number {
	return cues.reduce((found, cue) => (cue.start <= time && time < cue.end ? cue.index : found), -1)
}

export function splitMatches(text: string, query: string): AudioTranscriptPart[] {
	return highlightSearchMatches(text, query.trim())
}

export function transcriptToText(cues: AudioTranscriptCue[], duration: number): string {
	const lines = cues.map(cue => {
		const time = formatMediaTime(cue.start, Math.max(duration, cue.end))
		return cue.speaker ? `[${time}] ${cue.speaker}: ${cue.text}` : `[${time}] ${cue.text}`
	})
	return `${lines.join('\n')}\n`
}

export function transcriptFileName(title: string): string {
	const name = title
		.replace(/[\\/:*?"<>|]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
	return `${name || 'transcript'}.txt`
}
