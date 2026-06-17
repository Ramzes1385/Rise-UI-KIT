<template>
	<div
		class="base-progress"
		:class="[
			`base-progress--${props.shape}`,
			props.animation !== 'none' ? `base-progress--${props.animation}` : '',
			{ 'base-progress--indeterminate': props.isIndeterminate },
			classes.root,
		]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="progressbar"
		:aria-valuenow="percent"
		aria-valuemin="0"
		aria-valuemax="100">
		<!-- Линейный прогресс -->
		<template v-if="props.shape === 'line'">
			<div class="base-progress__track" :class="classes.track">
				<div class="base-progress__fill" :class="classes.fill" :style="{ width: `${percent}%` }">
					<div v-if="props.hasLabel" class="base-progress__tooltip-trigger" :class="classes.tooltipTrigger">
						<BaseTooltip
							:text="`${percent}%`"
							position="top"
							:is-always-visible="true"
							:size-scale="props.sizeScale"
							:color="tooltipColor">
							<span class="base-progress__tooltip-anchor" :class="classes.tooltipAnchor" />
						</BaseTooltip>
					</div>
				</div>
			</div>
		</template>

		<!-- Круговой прогресс -->
		<template v-if="props.shape === 'circle'">
			<svg class="base-progress__svg" :class="classes.svg" viewBox="0 0 120 120">
				<circle
					class="base-progress__track-circle"
					:class="classes.trackCircle"
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke-width="8" />
				<circle
					class="base-progress__fill-circle"
					:class="classes.fillCircle"
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke-width="8"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="circleOffset"
					stroke-linecap="round" />
			</svg>
			<BaseText
				v-if="props.hasLabel"
				tag="span"
				class="base-progress__circle-label"
				:weight="UI_FONT_WEIGHT_BOLD"
				:custom-class="classes.circleLabel">
				<slot :value="value" :percent="percent">{{ percent }}%</slot>
			</BaseText>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { BaseProgressEmits, BaseProgressProps } from '../model/BaseProgress.types'

import '../styles/BaseProgress.style.scss'

import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_FONT_WEIGHT_BOLD, UI_PROGRESS_CIRCLE_RADIUS, SIZE_SCALE_DEFAULT} from '@constants'
import { computed, watch } from 'vue'

const props = withDefaults(defineProps<BaseProgressProps>(), {
	max: 100,
	shape: 'line',
	animation: 'none',
	hasLabel: false,
	isIndeterminate: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseProgressEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'track',
		'fill',
		'tooltipTrigger',
		'tooltipAnchor',
		'svg',
		'trackCircle',
		'fillCircle',
		'circleLabel',
	],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Цвет тултипа соответствует цвету заливки */
const tooltipColor = computed(() => {
	if (props.color?.bg?.base) return { bg: { base: props.color.bg.base } }
	return { bg: { base: 'var(--color-accent)' } }
})

const percent = computed((): number => {
	if (props.isIndeterminate) return 0
	const clamped = Math.min(Math.max(props.value, 0), props.max)
	return Math.round((clamped / props.max) * 100)
})

const circumference = computed((): number => {
	return 2 * Math.PI * UI_PROGRESS_CIRCLE_RADIUS
})

const circleOffset = computed((): number => {
	if (props.isIndeterminate) return circumference.value
	return circumference.value * (1 - percent.value / 100)
})

watch(percent, value => {
	if (value >= 100) emit('complete')
})
</script>
