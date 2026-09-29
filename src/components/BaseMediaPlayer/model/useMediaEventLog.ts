import { formatMediaTime } from '@utils/mediaUtils'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import type { BaseMediaPlayerEmits } from '../types/BaseMediaPlayer.types'
import type { MediaEventLogEntry, MediaEventLogOptions } from '../types/MediaStatsPanel.types'

const LOG_LIMIT = 200

const DETAIL_LIMIT = 160

const SKIPPED_EVENTS = new Set(['update:currentTime'])

const frameSize = (media: HTMLVideoElement): string => `${media.videoWidth}×${media.videoHeight}`

const NO_DETAIL = (): string => ''

const MEDIA_DETAILS: Record<string, (media: HTMLVideoElement) => string> = {
	loadstart: media => media.currentSrc,
	loadedmetadata: media => `${frameSize(media)}, ${formatMediaTime(media.duration)}`,
	canplay: NO_DETAIL,
	playing: NO_DETAIL,
	waiting: NO_DETAIL,
	stalled: NO_DETAIL,
	seeking: NO_DETAIL,
	seeked: NO_DETAIL,
	resize: frameSize,
	emptied: NO_DETAIL,
	error: media => [media.error?.code, media.error?.message].filter(Boolean).join(': '),
}

const pad = (value: number, size = 2): string => String(value).padStart(size, '0')

function clock(date: Date): string {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

function position(time: number): string {
	return Number.isFinite(time) ? `${formatMediaTime(time)}.${Math.floor((time % 1) * 10)}` : formatMediaTime(time)
}

function describeValue(value: unknown): string {
	if (typeof value !== 'object' || value === null) return String(value)
	try {
		return JSON.stringify(value)
	} catch {
		return Object.prototype.toString.call(value)
	}
}

function describe(values: unknown[]): string {
	const text = values.map(describeValue).join(' ')
	return text.length > DETAIL_LIMIT ? `${text.slice(0, DETAIL_LIMIT - 1)}…` : text
}

export function useMediaEventLog(options: MediaEventLogOptions) {
	const entries = shallowRef<MediaEventLogEntry[]>([])
	let count = 0
	const add = (type: string, detail: string): void => {
		count += 1
		const entry = { id: count, clock: clock(new Date()), position: position(options.state.currentTime), type, detail }
		entries.value = [...entries.value.slice(1 - LOG_LIMIT), entry]
	}
	const onMediaEvent = (event: Event): void => add(event.type, MEDIA_DETAILS[event.type](event.target as HTMLVideoElement))
	const listen = (media: HTMLMediaElement | null | undefined, method: 'addEventListener' | 'removeEventListener'): void =>
		Object.keys(MEDIA_DETAILS).forEach(type => media?.[method](type, onMediaEvent))
	watch(
		options.media,
		(media, previous) => {
			listen(previous, 'removeEventListener')
			listen(media, 'addEventListener')
		},
		{ immediate: true },
	)
	onBeforeUnmount(() => listen(options.media.value, 'removeEventListener'))

	return {
		eventLog: entries,
		logEmits(emit: BaseMediaPlayerEmits): BaseMediaPlayerEmits {
			const send = emit as (event: string, ...values: unknown[]) => void
			return ((event: string, ...values: unknown[]) => {
				if (!SKIPPED_EVENTS.has(event)) add(event, describe(values))
				send(event, ...values)
			}) as BaseMediaPlayerEmits
		},
	}
}
