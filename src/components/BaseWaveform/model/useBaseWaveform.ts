import { computed, useId } from 'vue'
import { UI_AUDIO } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { formatMediaTime } from '@utils/mediaUtils'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseWaveformEmits, BaseWaveformProps } from '../types/BaseWaveform.types'

const DRAG_THRESHOLD = 4

const MIN_BAR = 0.06

const PAGE_SHARE = 0.1

function clampTime(time: number, duration: number): number {
	return Math.min(Math.max(time, 0), Math.max(duration, 0))
}

function timeAt(event: PointerEvent, duration: number): number {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	return rect.width > 0 ? clampTime(((event.clientX - rect.left) / rect.width) * duration, duration) : 0
}

function useWaveformPointer(props: BaseWaveformProps, emit: BaseWaveformEmits) {
	let origin: { x: number; time: number } | null = null
	let isDragging = false
	const drag = (event: PointerEvent): number => {
		const time = timeAt(event, props.duration)
		const start = origin?.time ?? time
		if (props.isSelectable) emit('update:selection', { start: Math.min(start, time), end: Math.max(start, time) })
		else emit('update:currentTime', time)
		return Math.min(start, time)
	}
	return {
		onPointerDown(event: PointerEvent): void {
			if (props.isDisabled || event.button !== 0) return
			;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
			origin = { x: event.clientX, time: timeAt(event, props.duration) }
			isDragging = false
		},
		onPointerMove(event: PointerEvent): void {
			if (!origin || (!isDragging && Math.abs(event.clientX - origin.x) < DRAG_THRESHOLD)) return
			isDragging = true
			drag(event)
		},
		onPointerUp(event: PointerEvent): void {
			if (!origin) return
			const start = isDragging ? drag(event) : null
			if (start !== null && props.isSelectable) emit('update:currentTime', start)
			else if (start === null) {
				emit('update:currentTime', origin.time)
				if (props.selection) emit('update:selection', null)
			}
			origin = null
		},
		onPointerCancel(): void {
			origin = null
		},
	}
}

function useWaveformKeys(props: BaseWaveformProps, emit: BaseWaveformEmits) {
	const page = (): number => props.duration * PAGE_SHARE
	const moves: Record<string, (time: number) => number> = {
		ArrowLeft: time => time - (props.step ?? 5),
		ArrowDown: time => time - (props.step ?? 5),
		ArrowRight: time => time + (props.step ?? 5),
		ArrowUp: time => time + (props.step ?? 5),
		PageDown: time => time - page(),
		PageUp: time => time + page(),
		Home: () => 0,
		End: () => props.duration,
	}
	const anchorFor = (current: number): number => {
		const range = props.selection
		if (range && current === range.start) return range.end
		return range && current === range.end ? range.start : current
	}
	return {
		onKeydown(event: KeyboardEvent): void {
			if (props.isDisabled) return
			if (event.key === 'Escape' && props.selection) return emit('update:selection', null)
			const move = moves[event.key]
			if (!move) return
			event.preventDefault()
			const current = props.currentTime ?? 0
			const time = clampTime(move(current), props.duration)
			const anchor = anchorFor(current)
			if (event.shiftKey && props.isSelectable)
				emit('update:selection', { start: Math.min(anchor, time), end: Math.max(anchor, time) })
			emit('update:currentTime', time)
		},
	}
}

function useWaveformView(props: BaseWaveformProps) {
	const fraction = computed(() => (props.duration > 0 ? clampTime(props.currentTime ?? 0, props.duration) / props.duration : 0))
	const share = (time: number): string => `${(Math.max(time, 0) / (props.duration || 1)) * 100}%`
	return {
		bars: computed(() =>
			props.peaks.map((peak, index) => ({
				height: `${Math.max(Math.min(peak, 1), MIN_BAR) * 100}%`,
				isPlayed: (index + 0.5) / props.peaks.length <= fraction.value,
			})),
		),
		selectionStyle: computed(() => {
			const range = props.selection
			const start = range ? clampTime(range.start, props.duration) : 0
			return range ? { left: share(start), width: share(clampTime(range.end, props.duration) - start) } : undefined
		}),
		valueText: computed(() =>
			formatMessage(UI_AUDIO.TIME, {
				current: formatMediaTime(props.currentTime ?? 0, props.duration),
				duration: formatMediaTime(props.duration),
			}),
		),
		selectionText: computed(() =>
			props.selection
				? formatMessage(UI_AUDIO.SELECTION, {
						start: formatMediaTime(props.selection.start, props.duration),
						end: formatMediaTime(props.selection.end, props.duration),
					})
				: '',
		),
	}
}

export function useBaseWaveform(props: BaseWaveformProps, emit: BaseWaveformEmits) {
	return {
		...useStandardBaseComponent('base-waveform', props, ['root', 'bar', 'selection']),
		...useWaveformView(props),
		...useWaveformPointer(props, emit),
		...useWaveformKeys(props, emit),
		selectionId: `base-waveform-${useId()}`,
		valueNow: computed(() => Math.round(props.currentTime ?? 0)),
	}
}
