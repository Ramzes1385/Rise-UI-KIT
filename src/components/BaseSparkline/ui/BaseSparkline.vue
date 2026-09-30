<template>
	<div
		class="base-sparkline"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, { height: `${height}px`, '--sparkline-color': stroke }]"
		role="img"
		:aria-label="summary"
		@pointermove="handlePointerMove"
		@pointerleave="handlePointerLeave">
		<div v-if="variant === 'bar'" class="base-sparkline__bars" aria-hidden="true">
			<span
				v-for="(point, index) in points"
				:key="index"
				class="base-sparkline__bar"
				:class="{ 'base-sparkline__bar--active': active === point }"
				:style="{ height: barHeight(point.value) }" />
		</div>
		<svg v-else class="base-sparkline__svg" :viewBox="`0 0 100 ${height}`" preserveAspectRatio="none" aria-hidden="true">
			<path v-if="variant === 'area'" class="base-sparkline__area" :d="area" />
			<path class="base-sparkline__line" :d="line" />
		</svg>
		<span
			v-if="variant !== 'bar' && points.length"
			class="base-sparkline__dot"
			:style="{ left: `${(active ?? points[points.length - 1]).x}%`, top: `${(active ?? points[points.length - 1]).y}px` }"
			aria-hidden="true" />
		<span v-if="active" class="base-sparkline__tooltip" :style="{ left: `${active.x}%` }" aria-hidden="true">
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
} = useBaseSparkline(props)
</script>
