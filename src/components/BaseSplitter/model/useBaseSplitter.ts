import type { Ref } from 'vue'
import { ref, useId, watch } from 'vue'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseSplitterEmits, SplitterProps, SplitterSize } from '../types/BaseSplitter.types'

function useSplitterSize(props: SplitterProps, emit: BaseSplitterEmits): SplitterSize {
	const size = ref(props.modelValue)
	watch(
		() => props.modelValue,
		value => {
			size.value = value
		},
	)

	function setSize(value: number, isFinal: boolean): void {
		const next = Math.min(props.max, Math.max(props.min, value))
		if (next !== size.value) {
			size.value = next
			emit('update:modelValue', next)
		}
		if (isFinal) emit('change', next)
	}

	return { size, setSize }
}

function useSplitterKeyboard(props: SplitterProps, state: SplitterSize): (event: KeyboardEvent) => void {
	let restoreSize = props.modelValue

	function toggleCollapsed(): number {
		if (state.size.value <= props.min) return restoreSize
		restoreSize = state.size.value
		return props.min
	}

	function sizeFor(key: string): number | undefined {
		const isHorizontal = props.orientation === 'horizontal'
		if (key === (isHorizontal ? 'ArrowLeft' : 'ArrowUp')) return state.size.value - props.step
		if (key === (isHorizontal ? 'ArrowRight' : 'ArrowDown')) return state.size.value + props.step
		if (key === 'Home') return props.min
		if (key === 'End') return props.max
		if (key === 'Enter') return toggleCollapsed()
		return undefined
	}

	return event => {
		const next = sizeFor(event.key)
		if (next === undefined) return
		event.preventDefault()
		state.setSize(next, true)
	}
}

function useSplitterDrag(props: SplitterProps, emit: BaseSplitterEmits, state: SplitterSize & { rootRef: Ref<HTMLElement | null> }) {
	const isDragging = ref(false)

	function handlePointerdown(event: PointerEvent): void {
		if (props.isDisabled || event.button !== 0) return
		event.preventDefault()
		const separator = event.currentTarget as HTMLElement
		separator.setPointerCapture?.(event.pointerId)
		separator.focus()
		isDragging.value = true
	}

	function handlePointermove(event: PointerEvent): void {
		if (!isDragging.value) return
		const rect = (state.rootRef.value as HTMLElement).getBoundingClientRect()
		const isHorizontal = props.orientation === 'horizontal'
		const length = isHorizontal ? rect.width : rect.height
		if (length <= 0) return
		const offset = isHorizontal ? event.clientX - rect.left : event.clientY - rect.top
		state.setSize(Math.round((offset / length) * 1000) / 10, false)
	}

	function handlePointerup(): void {
		if (!isDragging.value) return
		isDragging.value = false
		emit('change', state.size.value)
	}

	return { isDragging, handlePointerdown, handlePointermove, handlePointerup }
}

export function useBaseSplitter(props: SplitterProps, emit: BaseSplitterEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const startRef = ref<HTMLElement | null>(null)
	const endRef = ref<HTMLElement | null>(null)
	const state = useSplitterSize(props, emit)

	return {
		...useStandardBaseComponent('base-splitter', props, ['root', 'pane', 'separator']),
		startId: useId(),
		rootRef,
		startRef,
		endRef,
		isStartScrollable: useScrollableRegion({ elementRef: startRef }).isScrollable,
		isEndScrollable: useScrollableRegion({ elementRef: endRef }).isScrollable,
		size: state.size,
		handleKeydown: useSplitterKeyboard(props, state),
		...useSplitterDrag(props, emit, { ...state, rootRef }),
	}
}
