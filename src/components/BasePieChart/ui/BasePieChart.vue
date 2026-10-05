<template>
	<figure
		ref="root"
		class="base-pie-chart"
		:class="[variantClass, animationClass, classes.root]"
		:style="sizeScaleStyle"
		:aria-label="label">
		<div class="base-pie-chart__chart" :style="{ width: `${size}px`, height: `${size}px` }">
			<svg class="base-pie-chart__svg" viewBox="0 0 42 42" aria-hidden="true">
				<circle class="base-pie-chart__track" cx="21" cy="21" :r="circleRadius" pathLength="100" />
				<circle
					v-for="segment in segments"
					:key="segment.label"
					class="base-pie-chart__segment"
					:class="segmentClass(segment)"
					:style="segmentStyle(segment)"
					cx="21"
					cy="21"
					:r="circleRadius"
					pathLength="100"
					:stroke="segment.color"
					:stroke-dasharray="segment.dash"
					:stroke-dashoffset="segment.offset"
					@transitionend="onTransitionEnd(segment, $event)"
					@pointerenter="setActive(segment.label)"
					@pointerleave="setActive(null)" />
			</svg>
			<div v-if="variant === 'donut'" class="base-pie-chart__center" aria-hidden="true">
				<strong>{{ activeView ? format(activeView.value) : total }}</strong>
				<span>{{ activeView ? activeView.label : label }}</span>
			</div>
		</div>
		<ul class="base-pie-chart__legend" :class="classes.legend">
			<li
				v-for="view in views"
				:key="view.label"
				class="base-pie-chart__item"
				:class="{ 'base-pie-chart__item--active': activeView?.label === view.label }"
				@pointerenter="setActive(view.label)"
				@pointerleave="setActive(null)">
				<span class="base-pie-chart__swatch" :style="{ backgroundColor: view.color }" aria-hidden="true" />
				<span class="base-pie-chart__name">{{ view.label }}</span>
				<span class="base-pie-chart__value">{{ format(view.value) }}</span>
				<span class="base-pie-chart__percent">{{ percentText(view) }}</span>
			</li>
		</ul>
	</figure>
</template>

<script setup lang="ts">
import '../styles/BasePieChart.style.scss'
import { useBasePieChart } from '../model/useBasePieChart'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BasePieChartProps } from '../types/BasePieChart.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BasePieChartProps>(),
	kitDefaults('BasePieChart', {
		variant: 'donut',
		maxSegments: 6,
		size: 160,
		animation: 'sweep',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const {
	sizeScaleStyle,
	variantClass,
	animationClass,
	classes,
	circleRadius,
	segments,
	views,
	activeView,
	total,
	format,
	percentText,
	segmentClass,
	segmentStyle,
	onTransitionEnd,
	setActive,
} = useBasePieChart(props)
</script>
