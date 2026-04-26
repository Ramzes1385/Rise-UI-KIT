<template>
	<div
		class="base-card"
		:class="[variantClass, { 'base-card--hoverable': isHoverable, 'base-card--scroll': scroll }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="image" class="base-card__image-wrapper">
			<BaseImage :src="image" :alt="imageAlt" class="base-card__image" :size-scale="sizeScale" />
			<div v-if="$slots.overlay" class="base-card__overlay">
				<slot name="overlay" :size-scale="sizeScale" />
			</div>
		</div>

		<div v-if="title || subtitle || $slots.header || $slots.actions" class="base-card__header">
			<slot name="header" :size-scale="sizeScale">
				<div class="base-card__header-text">
					<BaseText v-if="title" tag="h3" :size-scale="sizeScale" :weight="600" class="base-card__title">{{
						title
					}}</BaseText>
					<BaseText
						v-if="subtitle"
						tag="p"
						:size-scale="sizeScale"
						:color="{ text: { base: 'var(--color-text-muted)' } }"
						class="base-card__subtitle"
						>{{ subtitle }}</BaseText
					>
				</div>
			</slot>
			<div v-if="$slots.actions" class="base-card__actions">
				<slot name="actions" :size-scale="sizeScale" />
			</div>
		</div>

		<div class="base-card__body">
			<slot :size-scale="sizeScale" />
		</div>

		<footer v-if="$slots.footer" class="base-card__footer">
			<slot name="footer" :size-scale="sizeScale" />
		</footer>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseImage } from '@/shared/ui/BaseImage'
import { BaseText } from '@/shared/ui/BaseText'
import './BaseCard.style.scss'
import type { BaseCardProps } from './BaseCard.types'

const props = withDefaults(defineProps<BaseCardProps>(), {
	isHoverable: false,
	variant: 'default',
	imageAlt: '',
	sizeScale: 100,
	scroll: false,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-card', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
</script>
