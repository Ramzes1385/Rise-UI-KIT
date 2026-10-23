<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			`base-progress--${shape}`,
			animation !== 'none' ? `base-progress--${animation}` : '',
			fillClass,
			{ 'base-progress--indeterminate': isIndeterminate, 'base-progress--countdown': isCountdown, 'base-progress--paused': isPaused },
			classes.root,
		]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="progressbar"
		:aria-label="ariaLabel || UI_ARIA.PROGRESS"
		:aria-valuenow="isIndeterminate || isCountdown ? undefined : percent"
		:aria-valuetext="valueText"
		aria-valuemin="0"
		aria-valuemax="100">
		<template v-if="shape === 'line'">
			<div v-if="isLabelVisible" :class="[ui('status'), classes.tooltipTrigger]" :style="percentStyle">
				<span :class="[ui('status-text'), classes.tooltipAnchor]">
					<slot :value="value" :percent="percent">{{ displayPercent }}%</slot>
				</span>
			</div>
			<div :class="[ui('track'), classes.track]">
				<div :class="ui('bar')">
					<div :class="[ui('fill'), classes.fill]" :style="fillStyle"></div>
				</div>
			</div>
		</template>

		<template v-if="shape === 'circle'">
			<svg :class="[ui('svg'), classes.svg]" :viewBox="circleViewBox">
				<defs v-if="gradientStops.length">
					<linearGradient :id="gradientId" x1="0" y1="1" x2="1" y2="0">
						<stop v-for="stop in gradientStops" :key="stop.offset" :offset="stop.offset" :style="{ stopColor: stop.color }" />
					</linearGradient>
				</defs>
				<circle
					:class="[ui('track-circle'), classes.trackCircle]"
					:cx="circleCenter"
					:cy="circleCenter"
					:r="circleRadius"
					fill="none"
					:stroke-width="circleStroke" />
				<circle
					:class="[ui('fill-circle'), classes.fillCircle]"
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
			<span v-if="isLabelVisible" :class="[ui('circle-label'), classes.circleLabel]">
				<slot :value="value" :percent="percent">{{ displayPercent }}%</slot>
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
		isPaused: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseProgressEmits>()
defineSlots<BaseProgressSlots>()

const {
	ui,
	rootRef,
	classes,
	sizeScaleStyle,
	customColorStyle,
	percent,
	valueText,
	isLabelVisible,
	displayPercent,
	percentStyle,
	fillStyle,
	fillClass,
	isCountdown,
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
