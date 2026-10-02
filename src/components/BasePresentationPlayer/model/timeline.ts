import { DOWNLOAD_PROTOCOLS, isSafeUrl } from '@utils/data/urlUtils'
import type { PresentationSlide } from '../types/BasePresentationPlayer.types'

export function safeUrl(url: string | undefined): string | undefined {
	return url && isSafeUrl(url, DOWNLOAD_PROTOCOLS) ? url : undefined
}

export function clampIndex(index: number, count: number): number {
	if (!Number.isFinite(index) || count === 0) return 0
	return Math.min(count - 1, Math.max(0, Math.trunc(index)))
}

export function trackStarts(slides: PresentationSlide[]): number[] {
	return slides.reduce<number[]>((starts, slide, index) => {
		const previous = index === 0 ? 0 : starts[index - 1] + (slides[index - 1].duration ?? 0)
		starts.push(Math.max(0, slide.at ?? previous))
		return starts
	}, [])
}

export function indexAtTime(starts: number[], time: number): number {
	return starts.reduce((found, start, index) => (start <= time + 0.05 ? index : found), 0)
}

export function slideSpan(starts: number[], index: number, trackDuration: number): readonly [number, number] {
	const start = starts[index] ?? 0
	return [start, starts[index + 1] ?? trackDuration]
}

export function fraction(time: number, duration: number): number {
	if (!(duration > 0) || !Number.isFinite(duration)) return 0
	return Math.min(1, Math.max(0, time / duration))
}
