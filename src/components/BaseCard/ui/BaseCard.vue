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
						:weight="TEXT_WEIGHT.SEMIBOLD"
						class="base-card__title"
						:custom-class="classes.title"
						>{{ title }}</BaseText
					>
					<BaseText
						v-if="subtitle"
						tag="p"
						:size-scale="sizeScale"
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

		<div class="base-card__body" :class="classes.body" :tabindex="scroll ? 0 : undefined">
			<slot :size-scale="sizeScale" />
		</div>

		<div v-if="$slots.footer" class="base-card__footer" :class="classes.footer">
			<slot name="footer" :size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCard.style.scss'
import { useBaseCard } from '../model/useBaseCard'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import type { BaseCardProps, BaseCardSlots } from '../types/BaseCard.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseCardProps>(),
	kitDefaults('BaseCard', {
		variant: DEFAULT_VARIANT,
		isHoverable: false,
		padding: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
		scroll: false,
	}),
)

defineSlots<BaseCardSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, cardStyle } = useBaseCard(props)
</script>
