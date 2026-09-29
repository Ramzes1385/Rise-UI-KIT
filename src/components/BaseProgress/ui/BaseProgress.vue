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
			<svg class="base-progress__svg" :class="classes.svg" viewBox="0 0 120 120">
				<circle
					class="base-progress__track-circle"
					:class="classes.trackCircle"
					cx="60"
					cy="60"
					:r="circleRadius"
					fill="none"
					stroke-width="8" />
				<circle
					class="base-progress__fill-circle"
					:class="classes.fillCircle"
					cx="60"
					cy="60"
					:r="circleRadius"
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
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseProgressEmits>()
defineSlots<BaseProgressSlots>()

const { classes, sizeScaleStyle, customColorStyle, percent, isLabelVisible, fillStyle, circleRadius, circumference, circleOffset } =
	useBaseProgress(props, emit)
</script>
