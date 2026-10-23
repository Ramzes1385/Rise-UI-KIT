<template>
	<figure ref="root" :class="[ui('root'), variantClass, animationClass, classes.root]" :style="sizeScaleStyle" :aria-label="label">
		<div :class="ui('chart')" :style="{ width: `${size}px`, aspectRatio: '1' }">
			<svg :class="ui('svg')" viewBox="0 0 42 42" aria-hidden="true">
				<circle :class="ui('track')" cx="21" cy="21" :r="circleRadius" pathLength="100" />
				<circle
					v-for="segment in segments"
					:key="segment.label"
					:class="[ui('segment'), segmentClass(segment)]"
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
			<div v-if="variant === 'donut'" :class="ui('center')" aria-hidden="true">
				<strong>{{ activeView ? format(activeView.value) : total }}</strong>
				<span>{{ activeView ? activeView.label : label }}</span>
			</div>
		</div>
		<ul :class="[ui('legend'), classes.legend]">
			<li
				v-for="view in views"
				:key="view.label"
				:class="[ui('item'), { 'base-pie-chart__item--active': activeView?.label === view.label }]"
				@pointerenter="setActive(view.label)"
				@pointerleave="setActive(null)">
				<span :class="ui('swatch')" :style="{ backgroundColor: view.color }" aria-hidden="true" />
				<span :class="ui('name')">{{ view.label }}</span>
				<span :class="ui('value')">{{ format(view.value) }}</span>
				<span :class="ui('percent')">{{ percentText(view) }}</span>
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
	ui,
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
