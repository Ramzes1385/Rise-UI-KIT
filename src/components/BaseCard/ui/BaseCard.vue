<template>
	<div
		class="base-card"
		:class="[
			variantClass,
			{
				'base-card--hoverable': props.isHoverable,
				'base-card--scroll': props.scroll,
				'base-card--truncate': !props.scroll && props.height,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, cardStyle]">
		<div v-if="title || subtitle || $slots.header || $slots.actions" class="base-card__header" :class="classes.header">
			<slot name="header" :size-scale="props.sizeScale">
				<div class="base-card__header-text">
					<BaseText
						v-if="title"
						tag="h3"
						:size-scale="props.sizeScale"
						:weight="UI_FONT_WEIGHT_SEMIBOLD"
						class="base-card__title"
						:custom-class="classes.title"
						>{{ title }}</BaseText
					>
				<BaseText
					v-if="subtitle"
					tag="p"
					:size-scale="props.sizeScale"
					:color="{ text: { base: 'var(--color-text-muted)' } }"
						class="base-card__subtitle"
						:custom-class="classes.subtitle"
						>{{ subtitle }}</BaseText
					>
				</div>
			</slot>
			<div v-if="$slots.actions" class="base-card__actions" :class="classes.actions">
				<slot name="actions" :size-scale="props.sizeScale" />
			</div>
		</div>

		<div class="base-card__body" :class="classes.body">
			<slot :size-scale="props.sizeScale" />
		</div>

		<footer v-if="$slots.footer" class="base-card__footer" :class="classes.footer">
			<slot name="footer" :size-scale="props.sizeScale" />
		</footer>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { usePadding } from '@composables/usePadding'
import { UI_FONT_WEIGHT_SEMIBOLD } from '@constants'

import '../styles/BaseCard.style.scss'

import type { BaseCardProps, BaseCardSlots } from '../model/BaseCard.types'

const props = withDefaults(defineProps<BaseCardProps>(), {
	isHoverable: false,
	padding: 24,
	sizeScale: 100,
	scroll: false,
})

defineSlots<BaseCardSlots>()

const height = computed(() => props.height)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-card',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'title', 'subtitle', 'actions', 'body', 'footer'],
})
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad', defaultPadding: 24 })

const cardStyle = computed(() => ({
	...paddingStyle.value,
	'--card-height': height.value || 'auto',
}))
</script>
