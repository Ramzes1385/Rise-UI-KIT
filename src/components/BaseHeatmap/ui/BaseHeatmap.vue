<template>
	<div :class="[ui('root'), variantClass, classes.root]" :style="[sizeScaleStyle, { '--heatmap-color': mark }]">
		<div ref="scrollRef" :class="ui('scroll')" role="img" :aria-label="summary" :tabindex="isScrollable ? 0 : undefined">
			<svg :class="ui('svg')" :width="width + 28" :height="step * 7 + 18" aria-hidden="true">
				<text v-for="month in months" :key="month.key" :class="ui('caption')" :x="28 + month.week * step" y="10">
					{{ month.label }}
				</text>
				<text v-for="day in weekdays" :key="day.index" :class="ui('caption')" x="0" :y="18 + day.index * step + cellSize - 2">
					{{ day.label }}
				</text>
				<rect
					v-for="cell in cells"
					:key="cell.key"
					:class="[ui('cell'), `base-heatmap__cell--${cell.level}`, { 'base-heatmap__cell--active': active === cell }]"
					:x="28 + cell.week * step"
					:y="18 + cell.weekday * step"
					:width="cellSize"
					:height="cellSize"
					@pointerenter="setActive(cell)"
					@pointerleave="setActive(null)" />
			</svg>
		</div>
		<div :class="ui('footer')" aria-hidden="true">
			<span :class="ui('tooltip')">{{ tooltip }}</span>
			<span :class="ui('scale')">
				{{ UI_CHARTS.LESS }}
				<span v-for="level in 5" :key="level" :class="[ui('swatch'), `base-heatmap__cell--${level - 1}`]" />
				{{ UI_CHARTS.MORE }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseHeatmap.style.scss'
import { UI_CHARTS } from '@/locales/messages'
import { useBaseHeatmap } from '../model/useBaseHeatmap'
import type { BaseHeatmapProps } from '../types/BaseHeatmap.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(defineProps<BaseHeatmapProps>(), {
	variant: 'default',
	endDate: undefined,
	weeks: 53,
	firstDayOfWeek: undefined,
	markColor: undefined,
	formatValue: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const {
	sizeScaleStyle,
	variantClass,
	classes,
	scrollRef,
	isScrollable,
	cells,
	months,
	weekdays,
	width,
	cellSize,
	step,
	mark,
	active,
	tooltip,
	summary,
	setActive,
	ui,
} = useBaseHeatmap(props)
</script>
