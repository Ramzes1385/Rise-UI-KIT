<template>
	<div class="base-empty" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-empty__icon-wrapper" :class="classes.iconWrapper">
			<slot name="icon">
				<BaseIcon :name="emptyIcon" :size-scale="calcIconScale('lg', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div class="base-empty__content" :class="classes.content">
			<BaseText
				v-if="title"
				tag="h3"
				:weight="TEXT_WEIGHT.MEDIUM"
				:size-scale="sizeScale"
				class="base-empty__title"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<BaseText
				v-if="description"
				tag="p"
				:size-scale="sizeScale"
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
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseEmpty.style.scss'
import type { BaseEmptyProps, BaseEmptySlots } from '../model/BaseEmpty.types'

const props = withDefaults(
	defineProps<BaseEmptyProps>(),
	kitDefaults('BaseEmpty', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-empty', props, [
	'root',
	'iconWrapper',
	'icon',
	'content',
	'title',
	'description',
	'body',
	'actions',
])
defineSlots<BaseEmptySlots>()

const emptyIcon = computed((): string => props.icon || 'inbox')
</script>
