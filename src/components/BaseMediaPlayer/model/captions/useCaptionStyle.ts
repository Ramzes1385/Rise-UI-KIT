import { computed, ref } from 'vue'
import { captionPreset } from './subtitles'
import type { MediaCaptionDrag, MediaCaptionPoint, MediaCaptionStyle } from '../../types/content/MediaSubtitles.types'
import {
	MEDIA_CAPTION_SIZES,
	MEDIA_CAPTION_COLORS,
	MEDIA_CAPTION_PRESETS,
	MEDIA_CAPTION_BACKGROUNDS,
} from '../../types/content/MediaSubtitles.types'

const STORAGE_KEY = 'rise-media:captions'

const DEFAULT_STYLE: MediaCaptionStyle = { size: 100, color: 'white', background: 'semi', position: MEDIA_CAPTION_PRESETS.bottom }

function pick<T>(list: readonly T[], value: unknown, fallback: T): T {
	return list.includes(value as T) ? (value as T) : fallback
}

function isPercent(value: unknown): value is number {
	return typeof value === 'number' && value >= 0 && value <= 100
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
	return Math.round(value * 100) / 100
}

function readStyle(): MediaCaptionStyle {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<MediaCaptionStyle>
		const position = saved.position
		return {
			size: pick(MEDIA_CAPTION_SIZES, saved.size, DEFAULT_STYLE.size),
			color: pick(MEDIA_CAPTION_COLORS, saved.color, DEFAULT_STYLE.color),
			background: pick(MEDIA_CAPTION_BACKGROUNDS, saved.background, DEFAULT_STYLE.background),
			position: isPercent(position?.x) && isPercent(position?.y) ? { x: position.x, y: position.y } : DEFAULT_STYLE.position,
		}
	} catch {
		return DEFAULT_STYLE
	}
}

function writeStyle(style: MediaCaptionStyle): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(style))
	} catch {
		return
	}
}

function raiseOffset(box: HTMLElement): number {
	const [, offset = '0'] = getComputedStyle(box).getPropertyValue('translate').split(' ')
	return Number.parseFloat(offset) || 0
}

function startDrag(event: PointerEvent, origin: MediaCaptionPoint): MediaCaptionDrag | null {
	const box = event.currentTarget as HTMLElement
	const area = box.parentElement?.getBoundingClientRect()
	if (event.button !== 0 || !area?.width || !area.height) return null
	const rect = box.getBoundingClientRect()
	return {
		pointer: { x: event.clientX, y: event.clientY },
		origin: { x: origin.x, y: origin.y + (raiseOffset(box) / area.height) * 100 },
		area: { width: area.width, height: area.height },
		half: { x: (rect.width / 2 / area.width) * 100, y: (rect.height / 2 / area.height) * 100 },
	}
}

function capturePointer(event: PointerEvent): void {
	try {
		;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
	} catch {
		return
	}
}

function dragPosition(drag: MediaCaptionDrag, event: PointerEvent): MediaCaptionPoint {
	const x = drag.origin.x + ((event.clientX - drag.pointer.x) / drag.area.width) * 100
	const y = drag.origin.y + ((event.clientY - drag.pointer.y) / drag.area.height) * 100
	return { x: round(clamp(x, drag.half.x, 100 - drag.half.x)), y: round(clamp(y, drag.half.y, 100 - drag.half.y)) }
}

export function useCaptionStyle() {
	const style = ref<MediaCaptionStyle>(readStyle())
	const drag = ref<MediaCaptionDrag | null>(null)
	const preset = computed(() => captionPreset(style.value.position))

	return {
		captionStyle: style,
		isCaptionDragging: computed(() => drag.value !== null),
		captionBoxStyle: computed(() => ({
			left: `${style.value.position.x}%`,
			top: `${style.value.position.y}%`,
			'--caption-scale': style.value.size / 100,
		})),
		captionBoxClass: computed(() => [
			`base-media-player__caption-box--color-${style.value.color}`,
			`base-media-player__caption-box--background-${style.value.background}`,
			{
				'base-media-player__caption-box--raised': preset.value === 'bottom',
				'base-media-player__caption-box--dragging': drag.value !== null,
			},
		]),
		updateCaptionStyle(patch: Partial<MediaCaptionStyle>): void {
			style.value = { ...style.value, ...patch }
			writeStyle(style.value)
		},
		onCaptionPointerDown(event: PointerEvent): void {
			drag.value = startDrag(event, style.value.position)
			if (!drag.value) return
			event.preventDefault()
			capturePointer(event)
		},
		onCaptionPointerMove(event: PointerEvent): void {
			if (drag.value) style.value = { ...style.value, position: dragPosition(drag.value, event) }
		},
		onCaptionPointerUp(): void {
			if (!drag.value) return
			drag.value = null
			writeStyle(style.value)
		},
	}
}
