<template>
	<div
		class="base-stat"
		:class="[variantClass, classes.root, { 'base-stat--with-icon': !!$slots.icon }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-busy="isLoading || undefined">
		<dl class="base-stat__body">
			<dt class="base-stat__label" :class="classes.label">
				<slot name="label">{{ label }}</slot>
			</dt>
			<dd class="base-stat__value" :class="classes.value">
				<BaseSkeleton v-if="isLoading" width="60%" :height="28" />
				<slot v-else name="value" :formatted="formattedValue">{{ formattedValue }}</slot>
			</dd>
			<dd v-if="isLoading && hasChange" class="base-stat__change" :class="classes.change">
				<BaseSkeleton width="40%" />
			</dd>
			<dd v-else-if="hasChange" class="base-stat__change" :class="[`base-stat__change--${tone}`, classes.change]">
				<slot name="change" :formatted="formattedChange" :trend="trend" :tone="tone">
					<BaseIcon class="base-stat__trend" :name="trendIcon.name" :is-flip-y="trendIcon.isFlipY" />
					<span class="base-stat__delta">{{ formattedChange }}</span
					><span v-if="changeLabel" class="base-stat__period">{{ ` ${changeLabel}` }}</span>
				</slot>
			</dd>
		</dl>
		<div v-if="$slots.icon" class="base-stat__icon">
			<slot name="icon" />
		</div>
		<div v-if="$slots.chart" class="base-stat__chart" :class="classes.chart">
			<slot name="chart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseStat.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseStat } from '../model/useBaseStat'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseStatProps, BaseStatSlots } from '../types/BaseStat.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseStatProps>(),
	kitDefaults('BaseStat', {
		variant: DEFAULT_VARIANT,
		value: undefined,
		valueFormat: undefined,
		change: undefined,
		changeFormat: undefined,
		changeLabel: undefined,
		isInverse: false,
		isLoading: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseStatSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	formattedValue,
	hasChange,
	formattedChange,
	trend,
	tone,
	trendIcon,
} = useBaseStat(props)
</script>
