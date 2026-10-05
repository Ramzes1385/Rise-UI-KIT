import type { Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { computed, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseSplitterEmits, SplitterPane, SplitterProps, SplitterSeparator, SplitterSizes } from '../types/BaseSplitter.types'

const round = (value: number): number => Math.round(value * 10) / 10

function sizesFrom(props: SplitterProps): number[] {
	return props.sizes && props.sizes.length > 1 ? [...props.sizes] : [props.modelValue, round(100 - props.modelValue)]
}

function useSplitterSizes(props: SplitterProps, emit: BaseSplitterEmits): SplitterSizes {
	const sizes = ref(sizesFrom(props))
	const isMulti = computed(() => (props.sizes?.length ?? 0) > 1)
	watch([() => props.modelValue, () => props.sizes], () => {
		sizes.value = sizesFrom(props)
	})

	function boundsOf(index: number): [number, number] {
		if (!isMulti.value) return [props.min, props.max]
		const pair = sizes.value[index] + sizes.value[index + 1]
		return [Math.max(props.min, round(pair - props.max)), Math.min(props.max, round(pair - props.min))]
	}

	function emitChange(): void {
		if (isMulti.value) emit('sizes-change', sizes.value)
		else emit('change', sizes.value[0])
	}

	function setSize(index: number, value: number, isFinal: boolean): void {
		const [min, max] = boundsOf(index)
		const next = Math.min(max, Math.max(min, value))
		const current = sizes.value
		if (next !== current[index]) {
			const updated = [...current]
			updated[index + 1] = round(current[index] + current[index + 1] - next)
			updated[index] = next
			sizes.value = updated
			if (isMulti.value) emit('update:sizes', updated)
			else emit('update:modelValue', next)
		}
		if (isFinal) emitChange()
	}

	return { sizes, isMulti, boundsOf, setSize, emitChange }
}

function useSplitterKeyboard(props: SplitterProps, state: SplitterSizes): (event: KeyboardEvent, index: number) => void {
	const restoreSizes = new Map<number, number>()

	function toggleCollapsed(index: number, min: number): number {
		const size = state.sizes.value[index]
		if (size > min) {
			restoreSizes.set(index, size)
			return min
		}
		return restoreSizes.get(index) ?? sizesFrom(props)[index]
	}

	function sizeFor(key: string, index: number): number | undefined {
		const isHorizontal = props.orientation === 'horizontal'
		const size = state.sizes.value[index]
		const [min, max] = state.boundsOf(index)
		if (key === (isHorizontal ? 'ArrowLeft' : 'ArrowUp')) return size - props.step
		if (key === (isHorizontal ? 'ArrowRight' : 'ArrowDown')) return size + props.step
		if (key === 'Home') return min
		if (key === 'End') return max
		if (key === 'Enter') return toggleCollapsed(index, min)
		return undefined
	}

	return (event, index) => {
		const next = sizeFor(event.key, index)
		if (next === undefined) return
		event.preventDefault()
		state.setSize(index, next, true)
	}
}

function useSplitterDrag(props: SplitterProps, state: SplitterSizes & { rootRef: Ref<HTMLElement | null> }) {
	const dragIndex = ref<number | null>(null)

	function handlePointerdown(event: PointerEvent, index: number): void {
		if (props.isDisabled || event.button !== 0) return
		event.preventDefault()
		const separator = event.currentTarget as HTMLElement
		separator.setPointerCapture?.(event.pointerId)
		separator.focus()
		dragIndex.value = index
	}

	function handlePointermove(event: PointerEvent): void {
		const index = dragIndex.value
		if (index === null) return
		const rect = (state.rootRef.value as HTMLElement).getBoundingClientRect()
		const isHorizontal = props.orientation === 'horizontal'
		const length = isHorizontal ? rect.width : rect.height
		if (length <= 0) return
		const offset = isHorizontal ? event.clientX - rect.left : event.clientY - rect.top
		const before = state.sizes.value.slice(0, index).reduce((sum, size) => sum + size, 0)
		state.setSize(index, round(round((offset / length) * 100) - before), false)
	}

	function handlePointerup(): void {
		if (dragIndex.value === null) return
		dragIndex.value = null
		state.emitChange()
	}

	return { isDragging: computed(() => dragIndex.value !== null), handlePointerdown, handlePointermove, handlePointerup }
}

function slotOf(index: number, isMulti: boolean): SplitterPane['slot'] {
	if (isMulti) return `pane-${index + 1}`
	return index === 0 ? 'start' : 'end'
}

function modifierOf(index: number, count: number): string | undefined {
	if (index === count - 1) return 'base-splitter__pane--end'
	return index === 0 ? 'base-splitter__pane--start' : undefined
}

function useSplitterPanes(props: SplitterProps, state: SplitterSizes) {
	const baseId = useId()

	const panes = computed<SplitterPane[]>(() => {
		const count = state.sizes.value.length
		return state.sizes.value.map((size, index) => ({
			id: `${baseId}-${index + 1}`,
			slot: slotOf(index, state.isMulti.value),
			modifier: modifierOf(index, count),
			style: index === count - 1 ? undefined : { '--base-splitter-ratio': String(size / 100) },
		}))
	})

	const separators = computed<SplitterSeparator[]>(() =>
		panes.value.slice(0, -1).map((pane, index) => {
			const [min, max] = state.boundsOf(index)
			const base = props.label ?? UI_ARIA.SPLITTER
			return {
				'aria-label': props.paneLabels?.[index] ?? (state.isMulti.value ? `${base} ${index + 1}` : base),
				'aria-valuenow': Math.round(state.sizes.value[index]),
				'aria-valuemin': min,
				'aria-valuemax': max,
				'aria-controls': pane.id,
			}
		}),
	)

	const rootStyle = computed(() => (state.isMulti.value ? { '--base-splitter-gaps': String(panes.value.length - 1) } : undefined))

	return { panes, separators, rootStyle }
}

export function useBaseSplitter(props: SplitterProps, emit: BaseSplitterEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const state = useSplitterSizes(props, emit)

	return {
		...useStandardBaseComponent('base-splitter', props, ['root', 'pane', 'separator']),
		ui: useUi(props, 'base-splitter'),
		rootRef,
		...useSplitterPanes(props, state),
		handleKeydown: useSplitterKeyboard(props, state),
		...useSplitterDrag(props, { ...state, rootRef }),
	}
}
