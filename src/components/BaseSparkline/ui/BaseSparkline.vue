<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, { height: `${height}px`, '--sparkline-color': stroke }]"
		role="img"
		:aria-label="summary"
		@pointermove="handlePointerMove"
		@pointerleave="handlePointerLeave">
		<div v-if="variant === 'bar'" :class="ui('bars')" aria-hidden="true">
			<span
				v-for="(point, index) in points"
				:key="index"
				:class="[ui('bar'), { 'base-sparkline__bar--active': active === point }]"
				:style="{ height: barHeight(point.value) }" />
		</div>
		<svg v-else :class="ui('svg')" :viewBox="`0 0 100 ${height}`" preserveAspectRatio="none" aria-hidden="true">
			<path v-if="variant === 'area'" :class="ui('area')" :d="area" />
			<path :class="ui('line')" :d="line" />
		</svg>
		<span
			v-if="variant !== 'bar' && points.length"
			:class="ui('dot')"
			:style="{ left: `${(active ?? points[points.length - 1]).x}%`, top: `${(active ?? points[points.length - 1]).y}px` }"
			aria-hidden="true" />
		<span v-if="active" :class="ui('tooltip')" :style="{ left: `${active.x}%` }" aria-hidden="true">
			<strong>{{ format(active.value) }}</strong>
			<span v-if="active.label">{{ active.label }}</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSparkline.style.scss'
import { useBaseSparkline } from '../model/useBaseSparkline'
import type { BaseSparklineProps } from '../types/BaseSparkline.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(defineProps<BaseSparklineProps>(), {
	variant: 'line',
	labels: () => [],
	markColor: undefined,
	height: 32,
	formatValue: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const {
	sizeScaleStyle,
	variantClass,
	classes,
	height,
	points,
	line,
	area,
	barHeight,
	stroke,
	active,
	format,
	summary,
	handlePointerMove,
	handlePointerLeave,
	ui,
	rootRef,
} = useBaseSparkline(props)
</script>
