import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import type { MediaSliderEmits, MediaSliderProps, MediaSliderSlots } from '../../types/controls/MediaSlider.types'

function clamp(value: number, max: number): number {
	return Math.min(max, Math.max(0, value))
}

function toPercent(value: number, max: number): number {
	return (clamp(value, max) / max) * 100
}

function keySteps(props: MediaSliderProps): Record<string, (value: number) => number> {
	return {
		ArrowLeft: value => value - props.step,
		ArrowDown: value => value - props.step,
		ArrowRight: value => value + props.step,
		ArrowUp: value => value + props.step,
		PageDown: value => value - props.largeStep,
		PageUp: value => value + props.largeStep,
		Home: () => 0,
		End: () => props.max,
	}
}

function rangeStyles(props: MediaSliderProps, ranges: MediaSliderProps['buffered']): Array<{ left: string; width: string }> {
	return (ranges ?? []).map(([start, end]) => {
		const left = toPercent(start, props.max)
		return { left: `${left}%`, width: `${toPercent(end, props.max) - left}%` }
	})
}

function bufferedStyles(props: MediaSliderProps): Array<{ transform: string }> {
	return (props.buffered ?? []).map(([start, end]) => {
		const left = toPercent(start, props.max)
		return { transform: `translateX(${left}%) scaleX(${(toPercent(end, props.max) - left) / 100})` }
	})
}

function segmentViews(props: MediaSliderProps, value: number, hover: number | null) {
	return (props.segments ?? []).map(segment => {
		const left = toPercent(segment.start, props.max)
		const length = segment.end - segment.start
		return {
			style: { left: `${left}%`, width: `${toPercent(segment.end, props.max) - left}%`, '--segment-color': segment.color },
			fillStyle: { transform: `scaleX(${length > 0 ? clamp((value - segment.start) / length, 1) : 0})` },
			isHovered: hover !== null && segment.start <= hover && hover < segment.end,
		}
	})
}

const TOOLTIP_OVERHANG = 12

function pointerRatio(event: PointerEvent, isVertical: boolean | undefined): number | null {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	const size = isVertical ? rect.height : rect.width
	if (!size) return null
	return isVertical ? (rect.bottom - event.clientY) / size : (event.clientX - rect.left) / size
}

function useHover(props: MediaSliderProps, isDisabled: Readonly<Ref<boolean>>, hasTooltip: () => boolean) {
	const hoverValue = ref<number | null>(null)
	const tooltipRef = ref<HTMLElement | null>(null)
	const size = ref({ track: 0, tip: 0 })
	watch(hoverValue, () => (size.value = { ...size.value, tip: tooltipRef.value?.offsetWidth ?? 0 }), { flush: 'post' })
	return {
		hoverValue,
		tooltipRef,
		isTooltipVisible: computed(() => hoverValue.value !== null && (hasTooltip() || Boolean(props.hoverText))),
		hoverLabel: computed(() => (hoverValue.value === null || !props.hoverText ? '' : props.hoverText(hoverValue.value))),
		hoverStyle: computed(() => {
			const { track, tip } = size.value
			const x = (toPercent(hoverValue.value ?? 0, props.max) / 100) * track
			const left = Math.max(tip / 2 - TOOLTIP_OVERHANG, Math.min(track - tip / 2 + TOOLTIP_OVERHANG, x))
			return { left: `${left}px`, '--media-tip-arrow': `${x - left}px` }
		}),
		onHover(event: PointerEvent): void {
			const ratio = pointerRatio(event, props.isVertical)
			size.value = { ...size.value, track: (event.currentTarget as HTMLElement).getBoundingClientRect().width }
			hoverValue.value = isDisabled.value || ratio === null ? null : clamp(ratio * props.max, props.max)
		},
		onHoverEnd(): void {
			hoverValue.value = null
		},
	}
}

function usePointerDrag(props: MediaSliderProps, emit: MediaSliderEmits, isDisabled: Readonly<Ref<boolean>>) {
	const rootRef = ref<HTMLElement | null>(null)
	const thumbRef = ref<HTMLElement | null>(null)
	const dragValue = ref<number | null>(null)
	const moveTo = (event: PointerEvent): void => {
		const ratio = pointerRatio(event, props.isVertical)
		dragValue.value = ratio === null ? 0 : clamp(ratio * props.max, props.max)
		emit('update:modelValue', dragValue.value)
	}
	return {
		rootRef,
		thumbRef,
		dragValue,
		onPointerDown(event: PointerEvent): void {
			if (isDisabled.value || event.button !== 0) return
			event.preventDefault()
			rootRef.value?.setPointerCapture?.(event.pointerId)
			thumbRef.value?.focus()
			moveTo(event)
		},
		onPointerMove(event: PointerEvent): void {
			if (dragValue.value !== null) moveTo(event)
		},
		onPointerEnd(): void {
			dragValue.value = null
		},
	}
}

export function useMediaSlider(props: MediaSliderProps, emit: MediaSliderEmits, slots: MediaSliderSlots) {
	const isDisabled = computed(() => !(props.max > 0) || !Number.isFinite(props.max))
	const drag = usePointerDrag(props, emit, isDisabled)
	const value = computed(() => (isDisabled.value ? 0 : clamp(drag.dragValue.value ?? props.modelValue, props.max)))
	const percent = computed(() => (isDisabled.value ? 0 : toPercent(value.value, props.max)))
	const steps = keySteps(props)
	const hover = useHover(props, isDisabled, () => Boolean(slots.tooltip))

	return {
		...drag,
		...hover,
		segments: computed(() => (isDisabled.value ? [] : segmentViews(props, value.value, hover.hoverValue.value))),
		onPointerMove(event: PointerEvent): void {
			hover.onHover(event)
			drag.onPointerMove(event)
		},
		isDisabled,
		isDragging: computed(() => drag.dragValue.value !== null),
		valueNow: computed(() => Math.round(value.value * 100) / 100),
		valueMax: computed(() => (isDisabled.value ? 0 : Math.round(props.max * 100) / 100)),
		fillStyle: computed(() => ({ transform: `${props.isVertical ? 'scaleY' : 'scaleX'}(${percent.value / 100})` })),
		railStyle: computed(() => ({
			transform: props.isVertical ? `translateY(${-percent.value}%)` : `translateX(${percent.value}%)`,
		})),
		bufferedStyles: computed(() => (isDisabled.value ? [] : bufferedStyles(props))),
		markerStyles: computed(() =>
			isDisabled.value ? [] : (props.markers ?? []).map(marker => ({ left: `${toPercent(marker, props.max)}%` })),
		),
		highlightStyles: computed(() => (isDisabled.value ? [] : rangeStyles(props, props.highlights))),
		onKeydown(event: KeyboardEvent): void {
			const step = steps[event.key]
			if (!step || isDisabled.value) return
			event.preventDefault()
			emit('update:modelValue', clamp(step(value.value), props.max))
		},
	}
}
