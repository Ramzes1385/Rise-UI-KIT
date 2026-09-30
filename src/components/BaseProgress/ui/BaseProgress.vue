<template>
	<div
		class="base-progress"
		:class="[
			`base-progress--${shape}`,
			animation !== 'none' ? `base-progress--${animation}` : '',
			fillClass,
			{ 'base-progress--indeterminate': isIndeterminate },
			classes.root,
		]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="progressbar"
		:aria-label="ariaLabel || UI_ARIA.PROGRESS"
		:aria-valuenow="isIndeterminate ? undefined : percent"
		:aria-valuetext="valueText"
		aria-valuemin="0"
		aria-valuemax="100">
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

		<template v-if="shape === 'circle'">
			<svg class="base-progress__svg" :class="classes.svg" :viewBox="circleViewBox">
				<defs v-if="gradientStops.length">
					<linearGradient :id="gradientId" x1="0" y1="1" x2="1" y2="0">
						<stop v-for="stop in gradientStops" :key="stop.offset" :offset="stop.offset" :style="{ stopColor: stop.color }" />
					</linearGradient>
				</defs>
				<circle
					class="base-progress__track-circle"
					:class="classes.trackCircle"
					:cx="circleCenter"
					:cy="circleCenter"
					:r="circleRadius"
					fill="none"
					:stroke-width="circleStroke" />
				<circle
					class="base-progress__fill-circle"
					:class="classes.fillCircle"
					:cx="circleCenter"
					:cy="circleCenter"
					:r="circleRadius"
					fill="none"
					:stroke-width="circleStroke"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="circleOffset"
					:style="circleStrokeStyle"
					stroke-linecap="round" />
			</svg>
			<span v-if="isLabelVisible" class="base-progress__circle-label" :class="classes.circleLabel">
				<slot :value="value" :percent="percent">{{ percent }}%</slot>
			</span>
		</template>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseProgress.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { useBaseProgress } from '../model/useBaseProgress'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseProgressEmits, BaseProgressProps, BaseProgressSlots } from '../types/BaseProgress.types'

const props = withDefaults(
	defineProps<BaseProgressProps>(),
	kitDefaults('BaseProgress', {
		max: 100,
		shape: 'line',
		animation: 'none',
		fill: 'solid',
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseProgressEmits>()
defineSlots<BaseProgressSlots>()

const {
	classes,
	sizeScaleStyle,
	customColorStyle,
	percent,
	valueText,
	isLabelVisible,
	fillStyle,
	fillClass,
	gradientId,
	gradientStops,
	circleStrokeStyle,
	circleViewBox,
	circleCenter,
	circleStroke,
	circleRadius,
	circumference,
	circleOffset,
} = useBaseProgress(props, emit)
</script>
