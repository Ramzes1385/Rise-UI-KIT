<template>
	<div
		class="base-progress"
		:class="[
			`base-progress--${shape}`,
			animation !== 'none' ? `base-progress--${animation}` : '',
			{ 'base-progress--indeterminate': isIndeterminate },
			classes.root,
		]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="progressbar"
		:aria-label="ariaLabel || UI_ARIA.PROGRESS"
		:aria-valuenow="isIndeterminate ? undefined : percent"
		aria-valuemin="0"
		aria-valuemax="100">
		<!-- Линейный прогресс: подпись над полосой движется вместе с концом заливки -->
		<template v-if="shape === 'line'">
			<div v-if="isLabelVisible" class="base-progress__status" :class="classes.tooltipTrigger" :style="{ width: `${percent}%` }">
				<span class="base-progress__status-text" :class="classes.tooltipAnchor">
					<slot :value="value" :percent="percent">{{ percent }}%</slot>
				</span>
			</div>
			<div class="base-progress__track" :class="classes.track">
				<div class="base-progress__fill" :class="classes.fill" :style="fillStyle"></div>
			</div>
		</template>

		<!-- Круговой прогресс -->
		<template v-if="shape === 'circle'">
			<svg class="base-progress__svg" :class="classes.svg" viewBox="0 0 120 120">
				<circle
					class="base-progress__track-circle"
					:class="classes.trackCircle"
					cx="60"
					cy="60"
					:r="CIRCLE_RADIUS"
					fill="none"
					stroke-width="8" />
				<circle
					class="base-progress__fill-circle"
					:class="classes.fillCircle"
					cx="60"
					cy="60"
					:r="CIRCLE_RADIUS"
					fill="none"
					stroke-width="8"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="circleOffset"
					stroke-linecap="round" />
			</svg>
			<span v-if="isLabelVisible" class="base-progress__circle-label" :class="classes.circleLabel">
				<slot :value="value" :percent="percent">{{ percent }}%</slot>
			</span>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import '../styles/BaseProgress.style.scss'

import { kitDefaults } from '@composables/useDefaults'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseProgressEmits, BaseProgressProps, BaseProgressSlots } from '../model/BaseProgress.types'

/** Радиус круга в системе координат viewBox 120×120 */
const CIRCLE_RADIUS = 52

const props = withDefaults(
	defineProps<BaseProgressProps>(),
	kitDefaults('BaseProgress', {
		max: 100,
		shape: 'line',
		animation: 'none',
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseProgressEmits>()
defineSlots<BaseProgressSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'track', 'fill', 'tooltipTrigger', 'tooltipAnchor', 'svg', 'trackCircle', 'fillCircle', 'circleLabel'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const percent = computed((): number => {
	if (props.isIndeterminate) return 0
	// Некорректный max (0, отрицательный, NaN, Infinity) или value=NaN давали деление
	// 0/0 или NaN → «NaN%» в подписи и aria-valuenow; такой прогресс считаем нулевым.
	if (!Number.isFinite(props.max) || props.max <= 0 || Number.isNaN(props.value)) return 0
	const clamped = Math.min(Math.max(props.value, 0), props.max)
	return Math.round((clamped / props.max) * 100)
})

/** В неопределённом режиме значение неизвестно: «0%» не показываем. */
const isLabelVisible = computed((): boolean => props.hasLabel && !props.isIndeterminate)

/** Ширину заливки в неопределённом режиме задают стили (бегущая или статичная полоса), а не значение. */
const fillStyle = computed(() => (props.isIndeterminate ? undefined : { width: `${percent.value}%` }))

const circumference = computed((): number => {
	return 2 * Math.PI * CIRCLE_RADIUS
})

const circleOffset = computed((): number => {
	if (props.isIndeterminate) return circumference.value
	return circumference.value * (1 - percent.value / 100)
})

watch(percent, value => {
	if (value >= 100) emit('complete')
})
</script>
