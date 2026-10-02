<template>
	<div
		ref="rootRef"
		class="base-rating"
		:class="[
			variantClass,
			classes.root,
			{
				'base-rating--interactive': isInteractive,
				'base-rating--readonly': isReadonly,
				'base-rating--disabled': isControlDisabled,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="ariaAttrs"
		@mouseleave="clearHover"
		@keydown="handleKeydown">
		<span
			v-for="star in starCount"
			:key="star"
			class="base-rating__star"
			@click="handleClick($event, star)"
			@mousemove="handleHover($event, star)">
			<BaseIcon :name="icon" :size-scale="sizeScale" :custom-class="classes.icon" aria-label="" />
			<span class="base-rating__star-fill" :style="{ width: `${fillPercent(star)}%` }">
				<BaseIcon :name="filledIcon" :size-scale="sizeScale" :custom-class="classes.iconFilled" aria-label="" />
			</span>
		</span>
		<span v-if="isValueShown" class="base-rating__value" :class="classes.value" aria-hidden="true">{{ valueLabel }}</span>
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseRating.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseRating } from '../model/useBaseRating'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRatingEmits, BaseRatingProps, BaseRatingSlots } from '../types/BaseRating.types'

const props = withDefaults(
	defineProps<BaseRatingProps>(),
	kitDefaults('BaseRating', {
		modelValue: 0,
		max: 5,
		step: 1,
		isHoverSmooth: true,
		isValueShown: false,
		icon: 'star',
		isReadonly: false,
		isDisabled: false,
		seo: false,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseRatingEmits>()
defineSlots<BaseRatingSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isControlDisabled,
	rootRef,
	isInteractive,
	starCount,
	filledIcon,
	ariaAttrs,
	fillPercent,
	valueLabel,
	handleClick,
	handleHover,
	clearHover,
	handleKeydown,
	structuredData,
	exposed,
} = useBaseRating(props, emit)

defineExpose(exposed)
</script>
