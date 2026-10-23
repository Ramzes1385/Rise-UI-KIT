<template>
	<div
		:class="[ui('root'), variantClass, { 'base-empty--compact': isCompact }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="hasIcon" :class="[ui('icon-wrapper'), classes.iconWrapper]">
			<slot name="icon">
				<BaseIcon :name="emptyIcon" :size-scale="calcIconScale(isCompact ? 'sm' : 'lg', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div :class="[ui('content'), classes.content]">
			<BaseText
				v-if="title"
				tag="h3"
				:weight="TEXT_WEIGHT.MEDIUM"
				:size-scale="sizeScale"
				:class="ui('title')"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<BaseText v-if="description" tag="p" :size-scale="sizeScale" :class="ui('description')" :custom-class="classes.description">
				{{ description }}
			</BaseText>

			<div v-if="$slots.default" :class="[ui('body'), classes.body]">
				<slot />
			</div>
		</div>

		<div v-if="$slots.actions" :class="[ui('actions'), classes.actions]">
			<slot name="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEmpty.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseEmpty } from '../model/useBaseEmpty'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import type { BaseEmptyProps, BaseEmptySlots } from '../types/BaseEmpty.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseEmptyProps>(),
	kitDefaults('BaseEmpty', {
		variant: DEFAULT_VARIANT,
		isCompact: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseEmptySlots>()

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, emptyIcon, hasIcon } = useBaseEmpty(props)
</script>
