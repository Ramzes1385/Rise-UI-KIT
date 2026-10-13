import { useTableUi } from '../useTableUi'
import { computed, onMounted, ref, watch } from 'vue'
import { getWidthBounds } from '@composables/table/useColumnResize/useColumnResizeUtils'
import type { BaseTableResizeHandleEmits, BaseTableResizeHandleProps } from '../../types/header/BaseTableResizeHandle.types'

const MIN_WIDTH = 50
const STEP = 10
const LARGE_STEP = 50
const KEY_DIRECTION: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

function measureRange(th: HTMLElement | null, declared: number): { width: number; max: number } {
	const width = th?.offsetWidth || declared
	const sibling = th?.nextElementSibling ?? th?.previousElementSibling
	const room = sibling instanceof HTMLElement ? sibling.offsetWidth - MIN_WIDTH : 0
	return { width, max: Math.max(MIN_WIDTH, width + Math.max(room, 0)) }
}

function capturePointer(handle: HTMLElement | null, event: PointerEvent): void {
	if (event.button !== 0 || event.isPrimary === false) return
	try {
		handle?.setPointerCapture?.(event.pointerId)
	} catch {
		return
	}
}

export function useBaseTableResizeHandle(props: BaseTableResizeHandleProps, emit: BaseTableResizeHandleEmits) {
	const handleRef = ref<HTMLElement | null>(null)
	const declaredWidth = (): number => parseInt(props.column.width ?? '') || 0
	const initial = measureRange(null, declaredWidth())
	const width = ref(initial.width)
	const maxWidth = ref(initial.max)
	const measure = (): void => {
		const range = measureRange(handleRef.value?.closest('th') ?? null, declaredWidth())
		width.value = range.width
		maxWidth.value = range.max
	}
	const bounds = computed(() => getWidthBounds(props.column, MIN_WIDTH))
	onMounted(measure)
	watch(() => props.column.width, measure, { flush: 'post' })
	return {
		ui: useTableUi(),
		handleRef,
		width,
		maxWidth: computed(() => Math.min(maxWidth.value, bounds.value.max)),
		minWidth: computed(() => bounds.value.min),
		onPointerdown(event: PointerEvent): void {
			capturePointer(handleRef.value, event)
			emit('resize-start', event)
		},
		onKeydown(event: KeyboardEvent): void {
			const direction = KEY_DIRECTION[event.key]
			if (!direction) return
			event.preventDefault()
			event.stopPropagation()
			emit('resize-by', event.currentTarget as HTMLElement, direction * (event.shiftKey ? LARGE_STEP : STEP))
		},
	}
}
