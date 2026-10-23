import type { useChartData } from './useChartData'
import { computed, ref, watch, type Ref } from 'vue'
import { useTween } from '@composables/interaction/useTween'
import { baselineState, motionStructure, packMotion, unpackMotion } from './chart/chartMotion'
import type { BaseChartProps, ChartFrame, ChartMotionState, ChartView } from '../types/BaseChart.types'

function initialState(props: BaseChartProps, data: ReturnType<typeof useChartData>, state: ChartMotionState): number[] | undefined {
	const isGrow = (props.animation ?? 'grow') === 'grow'
	if (!isGrow || props.variant === 'bar' || data.isEmpty.value) return undefined
	return packMotion(baselineState(state))
}

export function useChartMotion(props: BaseChartProps, data: ReturnType<typeof useChartData>, target: Readonly<Ref<Element | null>>) {
	const state = computed<ChartMotionState>(() => ({
		min: data.frame.value.domain.min,
		max: data.frame.value.domain.max,
		slots: data.slots.value,
		spans: data.spans.value,
	}))
	const structure = computed(() =>
		motionStructure(data.spans.value, `${props.variant}|${String(props.isStacked)}|${props.series.length}|${data.count.value}`),
	)
	const version = ref(0)
	watch(structure, () => {
		version.value += 1
	})
	let tweened = structure.value
	const tween = useTween(() => packMotion(state.value), {
		from: initialState(props, data, state.value),
		target,
		enabled: () => {
			const isSame = tweened === structure.value
			tweened = structure.value
			return isSame && props.updateAnimation !== 'none'
		},
	})
	const current = computed(() => unpackMotion(tween.value.value, props.series.length, data.count.value))
	const frame = computed<ChartFrame>(() => ({
		...data.frame.value,
		domain: { ...data.frame.value.domain, min: current.value.min, max: current.value.max },
	}))
	const view: ChartView = {
		spans: computed(() => current.value.spans),
		slots: computed(() => current.value.slots),
		frame,
	}
	const animation = computed(() => props.animation ?? 'grow')
	return {
		view,
		shapesKey: structure,
		shapesClass: computed(() => (version.value === 0 && animation.value !== 'none' ? `base-chart__shapes--${animation.value}` : '')),
		isSwapAnimated: computed(() => props.updateAnimation !== 'none'),
	}
}
