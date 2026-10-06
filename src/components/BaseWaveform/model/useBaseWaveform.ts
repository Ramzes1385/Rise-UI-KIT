import { UI_AUDIO } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseWaveformEmits, BaseWaveformProps } from '../types/BaseWaveform.types'

const DRAG_THRESHOLD = 4

const MIN_BAR = 0.06

const PAGE_SHARE = 0.1

const BAR_TO_GAP = 1.5

const MIN_BARS = 8

function clampTime(time: number, duration: number): number {
	return Math.min(Math.max(time, 0), Math.max(duration, 0))
}

function timeAt(event: PointerEvent, duration: number): number {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	return rect.width > 0 ? clampTime(((event.clientX - rect.left) / rect.width) * duration, duration) : 0
}

function useWaveformPointer(props: BaseWaveformProps, emit: BaseWaveformEmits) {
	let origin: { x: number; time: number } | null = null
	let isSelecting = false
	const select = (event: PointerEvent): number => {
		const time = timeAt(event, props.duration)
		const start = Math.min(origin?.time ?? time, time)
		emit('update:selection', { start, end: Math.max(origin?.time ?? time, time) })
		return start
	}
	return {
		onPointerDown(event: PointerEvent): void {
			if (props.isDisabled || event.button !== 0) return
			;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
			origin = { x: event.clientX, time: timeAt(event, props.duration) }
			isSelecting = false
			emit('update:currentTime', origin.time)
		},
		onPointerMove(event: PointerEvent): void {
			if (!origin) return
			if (!props.isSelectable) return emit('update:currentTime', timeAt(event, props.duration))
			if (!isSelecting && Math.abs(event.clientX - origin.x) < DRAG_THRESHOLD) return
			isSelecting = true
			select(event)
		},
		onPointerUp(event: PointerEvent): void {
			if (!origin) return
			if (isSelecting) emit('update:currentTime', select(event))
			else if (props.selection) emit('update:selection', null)
			origin = null
		},
		onPointerCancel(): void {
			origin = null
		},
	}
}

function fitPeaks(peaks: number[], count: number): number[] {
	if (count === peaks.length || peaks.length < 2) return peaks
	const step = (peaks.length - 1) / Math.max(count - 1, 1)
	if (count > peaks.length)
		return Array.from({ length: count }, (_, index) => {
			const position = index * step
			const low = Math.floor(position)
			const high = Math.min(low + 1, peaks.length - 1)
			return peaks[low] + (peaks[high] - peaks[low]) * (position - low)
		})
	const size = peaks.length / count
	return Array.from({ length: count }, (_, index) =>
		Math.max(...peaks.slice(Math.floor(index * size), Math.max(Math.floor((index + 1) * size), Math.floor(index * size) + 1))),
	)
}

function useBarCount(rootRef: Readonly<{ value: HTMLElement | null }>) {
	const count = ref(0)
	let observer: ResizeObserver | null = null
	const measure = (): void => {
		const element = rootRef.value as HTMLElement
		const gap = Number.parseFloat(getComputedStyle(element).columnGap)
		count.value = gap > 0 ? Math.max(MIN_BARS, Math.floor((element.clientWidth + gap) / (gap * (BAR_TO_GAP + 1)))) : 0
	}
	onMounted(() => {
		if (!rootRef.value || typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(measure)
		observer.observe(rootRef.value)
	})
	onBeforeUnmount(() => observer?.disconnect())
	return count
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

function useWaveformView(props: BaseWaveformProps, barCount: Readonly<{ value: number }>) {
	const fraction = computed(() => (props.duration > 0 ? clampTime(props.currentTime ?? 0, props.duration) / props.duration : 0))
	const share = (time: number): string => `${(Math.max(time, 0) / (props.duration || 1)) * 100}%`
	const levels = computed(() => fitPeaks(props.peaks, barCount.value || props.peaks.length))
	return {
		bars: computed(() =>
			levels.value.map((peak, index) => ({
				scale: `scaleY(${Math.max(Math.min(peak, 1), MIN_BAR)})`,
				isPlayed: (index + 0.5) / levels.value.length <= fraction.value,
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
	const rootRef = ref<HTMLElement | null>(null)
	return {
		...useStandardBaseComponent('base-waveform', props, ['root', 'bar', 'selection']),
		ui: useUi(props, 'base-waveform'),
		rootRef,
		...useWaveformView(props, useBarCount(rootRef)),
		...useWaveformPointer(props, emit),
		...useWaveformKeys(props, emit),
		selectionId: `base-waveform-${useId()}`,
		valueNow: computed(() => Math.round(props.currentTime ?? 0)),
	}
}
