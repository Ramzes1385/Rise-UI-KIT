<template>
	<div class="base-heatmap" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, { '--heatmap-color': mark }]">
		<div ref="scrollRef" class="base-heatmap__scroll" role="img" :aria-label="summary" :tabindex="isScrollable ? 0 : undefined">
			<svg class="base-heatmap__svg" :width="width + 28" :height="step * 7 + 18" aria-hidden="true">
				<text v-for="month in months" :key="month.key" class="base-heatmap__caption" :x="28 + month.week * step" y="10">
					{{ month.label }}
				</text>
				<text
					v-for="day in weekdays"
					:key="day.index"
					class="base-heatmap__caption"
					x="0"
					:y="18 + day.index * step + cellSize - 2">
					{{ day.label }}
				</text>
				<rect
					v-for="cell in cells"
					:key="cell.key"
					class="base-heatmap__cell"
					:class="[`base-heatmap__cell--${cell.level}`, { 'base-heatmap__cell--active': active === cell }]"
					:x="28 + cell.week * step"
					:y="18 + cell.weekday * step"
					:width="cellSize"
					:height="cellSize"
					@pointerenter="setActive(cell)"
					@pointerleave="setActive(null)" />
			</svg>
		</div>
		<div class="base-heatmap__footer" aria-hidden="true">
			<span class="base-heatmap__tooltip">{{ tooltip }}</span>
			<span class="base-heatmap__scale">
				{{ UI_CHARTS.LESS }}
				<span v-for="level in 5" :key="level" class="base-heatmap__swatch" :class="`base-heatmap__cell--${level - 1}`" />
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
} = useBaseHeatmap(props)
</script>
