<template>
	<figure :class="[ui('root'), variantClass, classes.root]" :style="sizeScaleStyle">
		<div v-if="isEmpty" :class="ui('empty')" :style="{ minHeight: plotHeight }">
			<slot name="empty">{{ UI_TEXT.EMPTY }}</slot>
		</div>
		<template v-else>
			<div :class="ui('body')">
				<div :class="ui('y-axis')" :style="{ height: plotHeight }" aria-hidden="true">
					<span
						v-for="tick in yTicks"
						:key="tick.text"
						:class="[ui('y-tick'), { 'base-chart__y-tick--outside': tick.isOutside }]"
						:style="tick.shift ? { transform: `translateY(${tick.shift}px)` } : undefined">
						{{ tick.text }}
					</span>
				</div>
				<div
					ref="plot"
					:class="[ui('plot'), classes.plot]"
					:style="{ height: plotHeight }"
					tabindex="0"
					role="img"
					:aria-label="summary"
					:aria-describedby="hintId"
					@pointermove="handlePointerMove"
					@pointerleave="handlePointerLeave"
					@keydown="handleKeydown"
					@blur="handlePointerLeave">
					<svg :class="ui('svg')" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
						<template v-if="hasGrid">
							<line
								v-for="tick in yTicks"
								:key="tick.text"
								:class="[ui('grid'), { 'base-chart__grid--outside': tick.isOutside }]"
								x1="0"
								x2="100"
								:y1="tick.position"
								:y2="tick.position" />
						</template>
						<Transition name="base-chart-swap" :css="isSwapAnimated">
							<g :key="shapesKey" :class="[ui('shapes'), shapesClass]">
								<template v-for="view in seriesViews" :key="view.name">
									<path
										v-if="view.area"
										:class="[ui('area'), { 'base-chart__area--hidden': view.isHidden }]"
										:style="{ '--base-chart-order': view.order }"
										:d="view.area"
										:fill="view.color" />
									<path
										v-if="view.line"
										:class="[ui('line'), { 'base-chart__line--hidden': view.isHidden }]"
										:style="{ '--base-chart-order': view.order }"
										:d="view.line"
										:stroke="view.color"
										pathLength="1" />
								</template>
								<rect
									v-for="bar in bars"
									:key="bar.key"
									:class="[
										ui('bar'),
										{ 'base-chart__bar--hidden': bar.isHidden, 'base-chart__bar--negative': bar.isNegative },
									]"
									:style="{ '--base-chart-order': bar.order }"
									:x="bar.x"
									:y="bar.y"
									:width="bar.width"
									:height="bar.height"
									:fill="bar.color" />
							</g>
						</Transition>
						<line v-if="guide !== null" :class="ui('guide')" :x1="guide" :x2="guide" y1="0" y2="100" />
					</svg>
					<span
						v-for="marker in markers"
						:key="marker.key"
						:class="ui('marker')"
						:style="{
							'--base-chart-marker-x': `${marker.offsetX}px`,
							'--base-chart-marker-y': `${marker.offsetY}px`,
							backgroundColor: marker.color,
						}"
						aria-hidden="true" />
					<div
						v-if="point"
						:class="[ui('tooltip'), { 'base-chart__tooltip--start': (guide ?? 0) > 50 }, classes.tooltip]"
						:style="{ '--base-chart-guide-x': `${guideOffset}px` }"
						aria-hidden="true">
						<slot name="tooltip" :point="point">
							<strong :class="ui('tooltip-label')">{{ point.label }}</strong>
							<span v-for="value in point.values" :key="value.name" :class="ui('tooltip-row')">
								<span :class="ui('swatch')" :style="{ backgroundColor: value.color }" />
								<span :class="ui('tooltip-name')">{{ value.name }}</span>
								<span :class="ui('tooltip-value')">{{ value.text }}</span>
							</span>
						</slot>
					</div>
				</div>
				<div :class="ui('x-axis')" aria-hidden="true">
					<span
						v-for="tick in xTicks"
						:key="tick.position"
						:class="[
							ui('x-tick'),
							{ 'base-chart__x-tick--start': tick.position <= 0, 'base-chart__x-tick--end': tick.position >= 100 },
						]"
						:style="{ left: `${tick.position}%` }">
						{{ tick.text }}
					</span>
				</div>
			</div>
			<span :id="hintId" class="base-chart__hidden">{{ UI_CHARTS.CHART_HINT }}</span>
			<span class="base-chart__hidden" role="status">{{ announcement }}</span>
			<ul v-if="hasLegend" :class="[ui('legend'), classes.legend]" :aria-label="UI_CHARTS.LEGEND">
				<li v-for="view in seriesViews" :key="view.name">
					<button
						type="button"
						:class="[ui('legend-item'), { 'base-chart__legend-item--hidden': view.isHidden }]"
						:aria-pressed="!view.isHidden"
						@click="toggleSeries(view.name)">
						<span :class="ui('swatch')" :style="{ backgroundColor: view.color }" aria-hidden="true" />
						{{ view.name }}
					</button>
				</li>
			</ul>
			<div class="base-chart__hidden">
				<table>
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
			</div>
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
		animation: 'grow',
		updateAnimation: 'tween',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseChartEmits>()
defineSlots<BaseChartSlots>()

const {
	ui,
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
	guideOffset,
	shapesKey,
	shapesClass,
	isSwapAnimated,
	announcement,
	handlePointerMove,
	handlePointerLeave,
	handleKeydown,
	toggleSeries,
} = useBaseChart(props, emit)
</script>
