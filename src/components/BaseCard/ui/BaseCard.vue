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

		<!-- Прокручиваемое тело фокусируемо: его можно прокрутить с клавиатуры (WCAG 2.1.1) -->
		<div class="base-card__body" :class="classes.body" :tabindex="scroll ? 0 : undefined">
			<slot :size-scale="sizeScale" />
		</div>

		<!-- div, а не footer: <footer> вне main/article/section — ориентир contentinfo, и несколько карточек дают дубли ориентиров -->
		<div v-if="$slots.footer" class="base-card__footer" :class="classes.footer">
			<slot name="footer" :size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePadding } from '@composables/usePadding'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseCard.style.scss'
import type { BaseCardProps, BaseCardSlots } from '../model/BaseCard.types'

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

const height = computed(() => props.height)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-card', props, [
	'root',
	'header',
	'title',
	'subtitle',
	'actions',
	'body',
	'footer',
])
const { paddingStyle: explicitPaddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad' })
/** Без пропа padding отступы секций берутся из стилей (16px 20px), inline-переменные не пишутся. */
const paddingStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

const cardStyle = computed(() => ({
	...paddingStyle.value,
	'--card-height': height.value || 'auto',
}))
</script>
