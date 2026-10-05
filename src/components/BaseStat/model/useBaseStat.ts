import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { formatNumber } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { useTween } from '@composables/interaction/useTween'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseStatProps, StatTone, StatTrend } from '../types/BaseStat.types'

const CHANGE_FORMAT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }

const MAX_FRACTION_DIGITS = 20

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

function fractionDigits(value: number): number {
	const [, fraction = ''] = String(value).split('.')
	return Math.min(fraction.length, MAX_FRACTION_DIGITS)
}

function useStatValue(props: BaseStatProps, rootRef: Ref<HTMLElement | null>) {
	const target = computed(() => (typeof props.value === 'number' ? props.value : Number.NaN))
	const tween = useTween(target, { target: rootRef, enabled: () => Number.isFinite(target.value) })
	const formattedValue = computed(() =>
		typeof props.value === 'number' ? formatNumber(props.value, props.valueFormat) : (props.value ?? ''),
	)
	const isValueTweening = computed(
		() => tween.isRunning.value && Number.isFinite(tween.value.value) && tween.value.value !== target.value,
	)
	return {
		formattedValue,
		isValueTweening,
		displayValue: computed(() => formatNumber(Number(tween.value.value.toFixed(fractionDigits(target.value))), props.valueFormat)),
	}
}

export function useBaseStat(props: BaseStatProps) {
	const rootRef = ref<HTMLElement | null>(null)
	const trend = computed(() => trendOf(props.change ?? 0))
	const tone = computed(() => toneOf(trend.value, Boolean(props.isInverse)))
	return {
		...useStandardBaseComponent('base-stat', props, ['root', 'label', 'value', 'change', 'chart']),
		...useStatValue(props, rootRef),
		ui: useUi(props, 'base-stat'),
		rootRef,
		hasChange: computed(() => typeof props.change === 'number' && Number.isFinite(props.change)),
		formattedChange: computed(() => formatNumber(props.change ?? 0, { ...CHANGE_FORMAT, ...props.changeFormat })),
		trend,
		tone,
		trendIcon: computed(() => TREND_ICON[trend.value]),
	}
}
