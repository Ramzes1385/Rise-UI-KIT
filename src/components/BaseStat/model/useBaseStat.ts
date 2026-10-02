import { computed } from 'vue'
import { formatNumber } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseStatProps, StatTone, StatTrend } from '../types/BaseStat.types'

const CHANGE_FORMAT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }

const TREND_ICON: Record<StatTrend, { name: string; isFlipY: boolean }> = {
	up: { name: 'arrow-down', isFlipY: true },
	down: { name: 'arrow-down', isFlipY: false },
	flat: { name: 'minus', isFlipY: false },
}

function trendOf(change: number): StatTrend {
	if (change > 0) return 'up'
	return change < 0 ? 'down' : 'flat'
}

function toneOf(trend: StatTrend, isInverse: boolean): StatTone {
	if (trend === 'flat') return 'neutral'
	return (trend === 'up') !== isInverse ? 'positive' : 'negative'
}

export function useBaseStat(props: BaseStatProps) {
	const trend = computed(() => trendOf(props.change ?? 0))
	const tone = computed(() => toneOf(trend.value, Boolean(props.isInverse)))
	return {
		...useStandardBaseComponent('base-stat', props, ['root', 'label', 'value', 'change', 'chart']),
		formattedValue: computed(() =>
			typeof props.value === 'number' ? formatNumber(props.value, props.valueFormat) : (props.value ?? ''),
		),
		hasChange: computed(() => typeof props.change === 'number' && Number.isFinite(props.change)),
		formattedChange: computed(() => formatNumber(props.change ?? 0, { ...CHANGE_FORMAT, ...props.changeFormat })),
		trend,
		tone,
		trendIcon: computed(() => TREND_ICON[trend.value]),
	}
}
