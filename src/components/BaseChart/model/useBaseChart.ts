import { useChartActive } from './useChartActive'
import { useChartAxes, useChartData } from './useChartData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseChartEmits, BaseChartProps } from '../types/BaseChart.types'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, useTemplateRef } from 'vue'

const X_TICK_WIDTH = 80
const X_TICKS_FALLBACK = 6
const DEFAULT_HEIGHT = 240

function usePlotWidth() {
	const plot = useTemplateRef<HTMLElement>('plot')
	const width = ref(0)
	const observer = shallowRef<ResizeObserver | null>(null)
	onMounted(() => {
		if (!plot.value || typeof ResizeObserver === 'undefined') return
		observer.value = new ResizeObserver(entries => {
			width.value = entries[0]?.contentRect.width ?? 0
		})
		observer.value.observe(plot.value)
	})
	onBeforeUnmount(() => observer.value?.disconnect())
	return computed(() => (width.value ? Math.max(2, Math.floor(width.value / X_TICK_WIDTH)) : X_TICKS_FALLBACK))
}

export function useBaseChart(props: BaseChartProps, emit: BaseChartEmits) {
	const localHidden = ref<readonly string[]>([...(props.hiddenSeries ?? [])])
	const hiddenNames = computed(() => props.hiddenSeries ?? localHidden.value)
	const data = useChartData(props, hiddenNames)
	const id = useId()
	return {
		...useStandardBaseComponent('base-chart', props, ['root', 'plot', 'legend', 'tooltip']),
		...useChartAxes(props, data, usePlotWidth()),
		...useChartActive(props, data),
		plotHeight: computed(() => `${props.height ?? DEFAULT_HEIGHT}px`),
		hintId: `${id}-hint`,
		isEmpty: data.isEmpty,
		seriesViews: data.seriesViews,
		bars: data.bars,
		toggleSeries(name: string): void {
			const next = data.hidden.value.has(name) ? hiddenNames.value.filter(item => item !== name) : [...hiddenNames.value, name]
			localHidden.value = next
			emit('update:hiddenSeries', next)
		},
	}
}
