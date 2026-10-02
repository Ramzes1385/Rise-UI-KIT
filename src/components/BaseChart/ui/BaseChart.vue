<template>
	<figure class="base-chart" :class="[variantClass, classes.root]" :style="sizeScaleStyle">
		<div v-if="isEmpty" class="base-chart__empty" :style="{ minHeight: plotHeight }">
			<slot name="empty">{{ UI_TEXT.EMPTY }}</slot>
		</div>
		<template v-else>
			<div class="base-chart__body">
				<div class="base-chart__y-axis" :style="{ height: plotHeight }" aria-hidden="true">
					<span v-for="tick in yTicks" :key="tick.position" class="base-chart__y-tick">{{ tick.text }}</span>
				</div>
				<div
					ref="plot"
					class="base-chart__plot"
					:class="classes.plot"
					:style="{ height: plotHeight }"
					tabindex="0"
					role="img"
					:aria-label="summary"
					:aria-describedby="hintId"
					@pointermove="handlePointerMove"
					@pointerleave="handlePointerLeave"
					@keydown="handleKeydown"
					@blur="handlePointerLeave">
					<svg class="base-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
						<template v-if="hasGrid">
							<line
								v-for="tick in yTicks"
								:key="tick.position"
								class="base-chart__grid"
								x1="0"
								x2="100"
								:y1="tick.position"
								:y2="tick.position" />
						</template>
						<template v-for="view in seriesViews" :key="view.name">
							<path v-if="view.area && !view.isHidden" class="base-chart__area" :d="view.area" :fill="view.color" />
							<path v-if="view.line && !view.isHidden" class="base-chart__line" :d="view.line" :stroke="view.color" />
						</template>
						<rect
							v-for="bar in bars"
							:key="bar.key"
							class="base-chart__bar"
							:x="bar.x"
							:y="bar.y"
							:width="bar.width"
							:height="bar.height"
							:fill="bar.color" />
						<line v-if="guide !== null" class="base-chart__guide" :x1="guide" :x2="guide" y1="0" y2="100" />
					</svg>
					<span
						v-for="marker in markers"
						:key="marker.key"
						class="base-chart__marker"
						:style="{ left: `${marker.x}%`, top: `${marker.y}%`, backgroundColor: marker.color }"
						aria-hidden="true" />
					<div
						v-if="point"
						class="base-chart__tooltip"
						:class="[{ 'base-chart__tooltip--start': (guide ?? 0) > 50 }, classes.tooltip]"
						:style="{ left: `${guide}%` }"
						aria-hidden="true">
						<slot name="tooltip" :point="point">
							<strong class="base-chart__tooltip-label">{{ point.label }}</strong>
							<span v-for="value in point.values" :key="value.name" class="base-chart__tooltip-row">
								<span class="base-chart__swatch" :style="{ backgroundColor: value.color }" />
								<span class="base-chart__tooltip-name">{{ value.name }}</span>
								<span class="base-chart__tooltip-value">{{ value.text }}</span>
							</span>
						</slot>
					</div>
				</div>
				<div class="base-chart__x-axis" aria-hidden="true">
					<span v-for="tick in xTicks" :key="tick.position" class="base-chart__x-tick" :style="{ left: `${tick.position}%` }">
						{{ tick.text }}
					</span>
				</div>
			</div>
			<span :id="hintId" class="base-chart__hidden">{{ UI_CHARTS.CHART_HINT }}</span>
			<span class="base-chart__hidden" role="status">{{ announcement }}</span>
			<ul v-if="hasLegend" class="base-chart__legend" :class="classes.legend" :aria-label="UI_CHARTS.LEGEND">
				<li v-for="view in seriesViews" :key="view.name">
					<button
						type="button"
						class="base-chart__legend-item"
						:class="{ 'base-chart__legend-item--hidden': view.isHidden }"
						:aria-pressed="!view.isHidden"
						@click="toggleSeries(view.name)">
						<span class="base-chart__swatch" :style="{ backgroundColor: view.color }" aria-hidden="true" />
						{{ view.name }}
					</button>
				</li>
			</ul>
			<table class="base-chart__hidden">
				<caption>
					{{
						label
					}}
				</caption>
				<thead>
					<tr>
						<th scope="col">{{ labelsTitle ?? UI_CHARTS.CATEGORY }}</th>
						<th v-for="view in seriesViews" :key="view.name" scope="col">{{ view.name }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in tableRows" :key="row.key">
						<th scope="row">{{ row.label }}</th>
						<td v-for="(cell, index) in row.cells" :key="index">{{ cell }}</td>
					</tr>
				</tbody>
			</table>
		</template>
	</figure>
</template>

<script setup lang="ts">
import '../styles/BaseChart.style.scss'
import { useBaseChart } from '../model/useBaseChart'
import { UI_CHARTS, UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseChartEmits, BaseChartProps, BaseChartSlots } from '../types/BaseChart.types'

const props = withDefaults(
	defineProps<BaseChartProps>(),
	kitDefaults('BaseChart', {
		variant: 'line',
		labelsTitle: undefined,
		hiddenSeries: undefined,
		isStacked: false,
		height: 240,
		hasGrid: true,
		hasLegend: true,
		yTickCount: 5,
		valueFormat: undefined,
		labelFormat: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseChartEmits>()
defineSlots<BaseChartSlots>()

const {
	sizeScaleStyle,
	variantClass,
	classes,
	plotHeight,
	hintId,
	isEmpty,
	seriesViews,
	bars,
	yTicks,
	xTicks,
	tableRows,
	summary,
	point,
	markers,
	guide,
	announcement,
	handlePointerMove,
	handlePointerLeave,
	handleKeydown,
	toggleSeries,
} = useBaseChart(props, emit)
</script>
