<template>
	<div
		class="base-bank-card"
		:class="[
			variantClass,
			isCompact ? 'base-bank-card--compact' : 'base-bank-card--full',
			{ 'base-bank-card--expired': isExpired },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, faceStyle]">
		<span class="base-bank-card__summary">{{ summary }}</span>
		<span class="base-bank-card__brand" :class="classes.brand" aria-hidden="true">
			<CardBrandMark v-if="brand" :brand="brand" :brand-icons="brandIcons" />
		</span>
		<span v-if="label || $slots.default" class="base-bank-card__label" :class="classes.label">
			<slot>{{ label }}</slot>
		</span>
		<span class="base-bank-card__number" :class="classes.number" aria-hidden="true">{{ maskedNumber }}</span>
		<span v-if="!isCompact && holder" class="base-bank-card__holder" aria-hidden="true">{{ holder }}</span>
		<span v-if="expiryText || isExpired" class="base-bank-card__expiry" :class="classes.expiry" aria-hidden="true">
			<span v-if="isExpired" class="base-bank-card__expired">{{ UI_CARD.EXPIRED }}</span>
			{{ expiryText }}
		</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseBankCard.style.scss'
import { UI_CARD } from '@/locales/messages'
import CardBrandMark from './CardBrandMark.vue'
import { useBaseBankCard } from '../model/useBaseBankCard'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseBankCardProps, BaseBankCardSlots } from '../types/BaseBankCard.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseBankCardProps>(),
	kitDefaults('BaseBankCard', {
		variant: DEFAULT_VARIANT,
		brand: null,
		expiry: null,
		last4: '',
		isCompact: false,
		isExpired: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseBankCardSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	brand,
	expiryText,
	isExpired,
	summary,
	maskedNumber,
	faceStyle,
} = useBaseBankCard(props)
</script>
