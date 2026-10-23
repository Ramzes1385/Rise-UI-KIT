import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { GanttContext } from '../../types/BaseGanttModel.types'

function px(value: number): string {
	return `${value}px`
}

export function useGanttStyles(context: GanttContext, chartWidth: ComputedRef<number>, bodyHeight: ComputedRef<number>) {
	const { metrics, props } = context
	return {
		rootStyle: computed(() => ({
			'--gantt-row-height': px(metrics.value.rowHeight),
			'--gantt-list-width': px(metrics.value.listWidth),
			'--gantt-header-height': px(metrics.value.headerHeight),
			height: typeof props.height === 'number' ? px(props.height) : props.height,
		})),
		canvasStyle: computed(() => ({
			width: px(metrics.value.listWidth + chartWidth.value),
			height: px(metrics.value.headerHeight + bodyHeight.value),
		})),
		layerStyle: computed(() => ({
			top: px(metrics.value.headerHeight),
			left: px(metrics.value.listWidth),
			width: px(chartWidth.value),
			height: px(bodyHeight.value),
		})),
		timelineStyle: computed(() => ({ width: px(chartWidth.value) })),
	}
}
