import { computed, onMounted, ref } from 'vue'
import type { BaseTableResizeHandleEmits, BaseTableResizeHandleProps } from '../types/header/BaseTableResizeHandle.types'

const MIN_WIDTH = 50
const STEP = 10
const LARGE_STEP = 50
const KEY_DIRECTION: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

export function useBaseTableResizeHandle(props: BaseTableResizeHandleProps, emit: BaseTableResizeHandleEmits) {
	const handleRef = ref<HTMLElement | null>(null)
	const measuredWidth = ref(0)
	onMounted(() => {
		measuredWidth.value = handleRef.value?.closest('th')?.offsetWidth ?? 0
	})
	return {
		handleRef,
		width: computed(() => parseInt(props.column.width ?? '') || measuredWidth.value),
		minWidth: MIN_WIDTH,
		onKeydown(event: KeyboardEvent): void {
			const direction = KEY_DIRECTION[event.key]
			if (!direction) return
			event.preventDefault()
			event.stopPropagation()
			emit('resize-by', event.currentTarget as HTMLElement, direction * (event.shiftKey ? LARGE_STEP : STEP))
		},
	}
}
