<template>
	<figure class="base-pie-chart" :class="[variantClass, classes.root]" :style="sizeScaleStyle" :aria-label="label">
		<div class="base-pie-chart__chart" :style="{ width: `${size}px`, height: `${size}px` }">
			<svg class="base-pie-chart__svg" viewBox="0 0 42 42" aria-hidden="true">
				<circle class="base-pie-chart__track" cx="21" cy="21" :r="circleRadius" pathLength="100" />
				<circle
					v-for="(view, index) in views"
					:key="view.label"
					class="base-pie-chart__segment"
					:class="{ 'base-pie-chart__segment--dimmed': activeIndex !== null && activeIndex !== index }"
					cx="21"
					cy="21"
					:r="circleRadius"
					pathLength="100"
					:stroke="view.color"
					:stroke-dasharray="view.dash"
					:stroke-dashoffset="view.offset"
					@pointerenter="setActive(index)"
					@pointerleave="setActive(null)" />
			</svg>
			<div v-if="variant === 'donut'" class="base-pie-chart__center" aria-hidden="true">
				<strong>{{ activeIndex === null ? total : format(views[activeIndex].value) }}</strong>
				<span>{{ activeIndex === null ? label : views[activeIndex].label }}</span>
			</div>
		</div>
		<ul class="base-pie-chart__legend" :class="classes.legend">
			<li
				v-for="(view, index) in views"
				:key="view.label"
				class="base-pie-chart__item"
				:class="{ 'base-pie-chart__item--active': activeIndex === index }"
				@pointerenter="setActive(index)"
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
import type { BasePieChartProps } from '../types/BasePieChart.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(defineProps<BasePieChartProps>(), {
	variant: 'donut',
	maxSegments: 6,
	size: 160,
	formatValue: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, classes, circleRadius, views, activeIndex, total, format, percentText, setActive } =
	useBasePieChart(props)
</script>
