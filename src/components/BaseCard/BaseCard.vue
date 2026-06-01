<template>
	<div
		class="base-card"
		:class="[
			variantClass,
			{
				'base-card--hoverable': isHoverable,
				'base-card--scroll': scroll,
				'base-card--truncate': !scroll && height,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, cardStyle]">
		<div v-if="title || subtitle || $slots.header || $slots.actions" class="base-card__header" :class="classes.header">
			<slot name="header" :size-scale="sizeScale">
				<div class="base-card__header-text">
					<BaseText
						v-if="title"
						tag="h3"
						:size-scale="sizeScale"
						:weight="600"
						class="base-card__title"
						:custom-class="classes.title"
						>{{ title }}</BaseText
					>
					<BaseText
						v-if="subtitle"
						tag="p"
						:size-scale="sizeScale"
						:color="{ text: { base: 'var(--color-text-muted)' } }"
						class="base-card__subtitle"
						:custom-class="classes.subtitle"
						>{{ subtitle }}</BaseText
					>
				</div>
			</slot>
			<div v-if="$slots.actions" class="base-card__actions" :class="classes.actions">
				<slot name="actions" :size-scale="sizeScale" />
			</div>
		</div>

		<div class="base-card__body" :class="classes.body">
			<slot :size-scale="sizeScale" />
		</div>

		<footer v-if="$slots.footer" class="base-card__footer" :class="classes.footer">
			<slot name="footer" :size-scale="sizeScale" />
		</footer>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'

import './BaseCard.style.scss'

import type { BaseCardProps, BaseCardSlots } from './BaseCard.types'

const props = withDefaults(defineProps<BaseCardProps>(), {
	isHoverable: false,
	variant: 'default',
	padding: 24,
	sizeScale: 100,
	scroll: false,
})

defineSlots<BaseCardSlots>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-card', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'title', 'subtitle', 'actions', 'body', 'footer'],
})
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad', defaultPadding: 24 })

/** Стили карточки: padding и высота */
const cardStyle = computed(() => ({
	...paddingStyle.value,
	'--card-height': props.height || 'auto',
}))
</script>
