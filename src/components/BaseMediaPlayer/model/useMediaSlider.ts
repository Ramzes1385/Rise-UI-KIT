import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { MediaSliderEmits, MediaSliderProps } from '../types/MediaSlider.types'

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

function bufferedStyles(props: MediaSliderProps): Array<{ left: string; width: string }> {
	return (props.buffered ?? []).map(([start, end]) => {
		const left = toPercent(start, props.max)
		return { left: `${left}%`, width: `${toPercent(end, props.max) - left}%` }
	})
}

function usePointerDrag(props: MediaSliderProps, emit: MediaSliderEmits, isDisabled: Readonly<Ref<boolean>>) {
	const rootRef = ref<HTMLElement | null>(null)
	const thumbRef = ref<HTMLElement | null>(null)
	const dragValue = ref<number | null>(null)
	const moveTo = (event: PointerEvent): void => {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		dragValue.value = rect.width > 0 ? clamp(((event.clientX - rect.left) / rect.width) * props.max, props.max) : 0
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

export function useMediaSlider(props: MediaSliderProps, emit: MediaSliderEmits) {
	const isDisabled = computed(() => !(props.max > 0) || !Number.isFinite(props.max))
	const drag = usePointerDrag(props, emit, isDisabled)
	const value = computed(() => (isDisabled.value ? 0 : clamp(drag.dragValue.value ?? props.modelValue, props.max)))
	const percent = computed(() => (isDisabled.value ? 0 : toPercent(value.value, props.max)))
	const steps = keySteps(props)

	return {
		...drag,
		isDisabled,
		isDragging: computed(() => drag.dragValue.value !== null),
		valueNow: computed(() => Math.round(value.value * 100) / 100),
		valueMax: computed(() => (isDisabled.value ? 0 : Math.round(props.max * 100) / 100)),
		fillStyle: computed(() => ({ width: `${percent.value}%` })),
		thumbStyle: computed(() => ({ left: `${percent.value}%` })),
		bufferedStyles: computed(() => (isDisabled.value ? [] : bufferedStyles(props))),
		onKeydown(event: KeyboardEvent): void {
			const step = steps[event.key]
			if (!step || isDisabled.value) return
			event.preventDefault()
			emit('update:modelValue', clamp(step(value.value), props.max))
		},
	}
}
