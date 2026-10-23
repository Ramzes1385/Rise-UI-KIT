<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root, { 'base-stat--with-icon': !!$slots.icon }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-busy="isLoading || undefined">
		<dl :class="ui('body')">
			<dt :class="[ui('label'), classes.label]">
				<slot name="label">{{ label }}</slot>
			</dt>
			<dd :class="[ui('value'), classes.value]">
				<Transition name="base-stat-swap">
					<BaseSkeleton v-if="isLoading" width="60%" :height="28" />
					<span v-else :class="ui('content')">
						<slot name="value" :formatted="formattedValue">
							<template v-if="isValueTweening">
								<span aria-hidden="true">{{ displayValue }}</span>
								<span class="base-stat__sr">{{ formattedValue }}</span>
							</template>
							<template v-else>{{ formattedValue }}</template>
						</slot>
					</span>
				</Transition>
			</dd>
			<dd v-if="isLoading && hasChange" :class="[ui('change'), classes.change]">
				<BaseSkeleton width="40%" />
			</dd>
			<Transition name="base-stat-appear">
				<dd v-if="!isLoading && hasChange" :class="[ui('change'), `base-stat__change--${tone}`, classes.change]">
					<slot name="change" :formatted="formattedChange" :trend="trend" :tone="tone">
						<BaseIcon :class="ui('trend')" :name="trendIcon.name" :is-flip-y="trendIcon.isFlipY" />
						<span :class="ui('delta')">{{ formattedChange }}</span
						><span v-if="changeLabel" :class="ui('period')">{{ ` ${changeLabel}` }}</span>
					</slot>
				</dd>
			</Transition>
		</dl>
		<div v-if="$slots.icon" :class="ui('icon')">
			<slot name="icon" />
		</div>
		<div v-if="$slots.chart" :class="[ui('chart'), classes.chart]">
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
	ui,
	rootRef,
	isValueTweening,
	displayValue,
} = useBaseStat(props)
</script>
