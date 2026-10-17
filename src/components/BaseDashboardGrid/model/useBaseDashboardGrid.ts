import { useUi } from '@composables/base/useUi'
import { UI_DASHBOARD_GRID } from '@/locales/messages'
import { useDirection } from '@composables/app/useDirection'
import { computed, useId, watch, type CSSProperties } from 'vue'
import { itemRect, gridHeight } from './layout/dashboardGeometry'
import { useDashboardGridState } from './layout/useDashboardGridState'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useDashboardGridPointer } from './interaction/useDashboardGridPointer'
import { useDashboardGridKeyboard } from './interaction/useDashboardGridKeyboard'
import type {
	BaseDashboardGridEmits,
	DashboardGridProps,
	DashboardGridStylesInput,
	DashboardLayoutItem,
	DashboardRect,
} from '../types/BaseDashboardGrid.types'

const GRID_ELEMENTS = ['root', 'item', 'body', 'handle', 'resize', 'placeholder', 'empty', 'status', 'hint']

export function useBaseDashboardGrid(props: DashboardGridProps, emit: BaseDashboardGridEmits) {
	const { state, announcement, itemName } = useDashboardGridState(props, emit)
	const { sign } = useDirection(() => state.rootRef.value)
	const pointer = useDashboardGridPointer(state, sign)
	const keyboard = useDashboardGridKeyboard(state)
	const items = computed(() => state.draft.value ?? state.layout.value)
	const dragId = computed(() => pointer.dragRect.value?.id ?? null)
	const isFocusable = (item: DashboardLayoutItem): boolean => state.isInteractive.value && !item.isStatic

	watch(state.isInteractive, value => {
		if (value) return
		pointer.cancel()
		keyboard.reset()
	})

	return {
		...useStandardBaseComponent('base-dashboard-grid', props, GRID_ELEMENTS),
		ui: useUi(props, 'base-dashboard-grid'),
		rootRef: state.rootRef,
		hintId: useId(),
		items,
		announcement,
		dragId,
		grabbedId: keyboard.grabbedId,
		isInteractive: state.isInteractive,
		isEmpty: computed(() => items.value.length === 0),
		gridLabel: computed(() => props.ariaLabel || UI_DASHBOARD_GRID.LABEL),
		hintText: computed(() => UI_DASHBOARD_GRID.HINT),
		emptyText: computed(() => UI_DASHBOARD_GRID.EMPTY),
		...useDashboardGridStyles({ state, items, dragRect: pointer.dragRect, sign }),
		isFocusable,
		itemName,
		handleKeydown(event: KeyboardEvent): void {
			if (!pointer.dragRect.value) {
				keyboard.handleKeydown(event)
				return
			}
			if (event.key !== 'Escape') return
			event.stopPropagation()
			pointer.cancel()
		},
		handleFocusOut: keyboard.handleFocusOut,
		handlePointerDown: pointer.handlePointerDown,
		handlePointerMove: pointer.handlePointerMove,
		handlePointerUp: pointer.handlePointerUp,
		handlePointerCancel: pointer.handlePointerCancel,
	}
}

function useDashboardGridStyles(input: DashboardGridStylesInput) {
	const { state, items, dragRect, sign } = input
	return {
		heightStyle: computed((): CSSProperties => {
			const gap = { '--dashboard-grid-gap': `${state.metrics.value.gap}px` }
			return items.value.length ? { ...gap, height: `${gridHeight(items.value, state.metrics.value)}px` } : gap
		}),
		placeholderStyle: computed((): CSSProperties | null => {
			const item = items.value.find(other => other.id === dragRect.value?.id)
			return item ? rectStyle(itemRect(item, state.metrics.value), sign.value) : null
		}),
		itemStyle(item: DashboardLayoutItem): CSSProperties {
			const drag = dragRect.value
			return rectStyle(drag?.id === item.id ? drag.rect : itemRect(item, state.metrics.value), sign.value)
		},
	}
}

function rectStyle(rect: DashboardRect, sign: number): CSSProperties {
	return { width: `${rect.width}px`, height: `${rect.height}px`, transform: `translate3d(${sign * rect.left}px, ${rect.top}px, 0)` }
}
