/** Composable: логика BaseSplitter — размер первой панели, клавиши и перетаскивание разделителя */
import { ref, useId, watch } from 'vue'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { Ref } from 'vue'
import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseSplitterEmits, BaseSplitterProps } from './BaseSplitter.types'

/** Пропсы BaseSplitter после значений по умолчанию */
export type SplitterProps = PropsWithDefaults<BaseSplitterProps, 'modelValue' | 'orientation' | 'min' | 'max' | 'step' | 'isDisabled'>

/** Размер первой панели, %: работает и без v-model */
interface SplitterSize {
	size: Ref<number>
	/** Новый размер в границах min и max; `isFinal` — итог движения, для события `change` */
	setSize: (value: number, isFinal: boolean) => void
}

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

/** Клавиши по APG Window Splitter: стрелки — шаг, Home/End — границы, Enter сворачивает и возвращает панель */
function useSplitterKeyboard(props: SplitterProps, state: SplitterSize): (event: KeyboardEvent) => void {
	/** Размер до сворачивания по Enter: к нему разделитель вернётся */
	let restoreSize = props.modelValue

	/** Enter: свёрнутая панель возвращает прежний размер, иначе размер запоминается и панель сворачивается */
	function toggleCollapsed(): number {
		if (state.size.value <= props.min) return restoreSize
		restoreSize = state.size.value
		return props.min
	}

	/** Размер для клавиши; `undefined` — клавиша не наша */
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

/** Перетаскивание разделителя мышью и пальцем: размер — из положения указателя внутри компонента */
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

	/** Размер с точностью до десятой процента */
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

/**
 * Две панели с разделителем по образцу APG Window Splitter: размер первой панели в процентах,
 * клавиши, перетаскивание и прокручиваемые панели.
 */
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
		/** Панели с прокруткой получают tabindex, чтобы их можно было прокрутить с клавиатуры */
		isStartScrollable: useScrollableRegion({ elementRef: startRef }).isScrollable,
		isEndScrollable: useScrollableRegion({ elementRef: endRef }).isScrollable,
		size: state.size,
		handleKeydown: useSplitterKeyboard(props, state),
		...useSplitterDrag(props, emit, { ...state, rootRef }),
	}
}
