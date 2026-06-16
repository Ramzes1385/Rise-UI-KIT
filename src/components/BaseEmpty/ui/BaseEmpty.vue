<template>
	<div
		class="base-empty"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-empty__icon-wrapper" :class="classes.iconWrapper">
			<slot name="icon">
				<BaseIcon :name="emptyIcon" :size-scale="calcIconScale('lg', props.sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div class="base-empty__content" :class="classes.content">
			<BaseText
				v-if="title"
				tag="h3"
				:weight="UI_FONT_WEIGHT_SEMIBOLD"
				:size-scale="props.sizeScale"
				class="base-empty__title"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<BaseText
				v-if="description"
				tag="p"
				:size-scale="props.sizeScale - 10"
				class="base-empty__description"
				:custom-class="classes.description">
				{{ description }}
			</BaseText>

			<div v-if="$slots.default" class="base-empty__body" :class="classes.body">
				<slot />
			</div>
		</div>

		<div v-if="$slots.actions" class="base-empty__actions" :class="classes.actions">
			<slot name="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { UI_FONT_WEIGHT_SEMIBOLD } from '@constants'
import { computed } from 'vue'

import '../styles/BaseEmpty.style.scss'
import type { BaseEmptyProps } from '../model/BaseEmpty.types'

const props = withDefaults(defineProps<BaseEmptyProps>(), {
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-empty',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'body', 'actions'],
})

const emptyIcon = computed((): string => props.icon || 'inbox')
</script>
