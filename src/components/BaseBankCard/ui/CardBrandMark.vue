<template>
	<span class="card-brand-mark" aria-hidden="true">
		<img v-if="image" class="card-brand-mark__image" :src="image" alt="" />
		<svg v-else-if="path" class="card-brand-mark__icon" :viewBox="CARD_BRAND_ICON_VIEW_BOX">
			<path :d="path" fill="currentColor" />
		</svg>
		<span v-else class="card-brand-mark__name">{{ name }}</span>
	</span>
</template>

<script setup lang="ts">
import '../styles/CardBrandMark.style.scss'
import { useCardBrandMark } from '../model/useCardBrandMark'
import { CARD_BRAND_ICON_VIEW_BOX } from '@utils/form/cardFaceUtils'
import type { CardBrandMarkProps } from '../types/cardBrandMark.types'

const props = defineProps<CardBrandMarkProps>()

const { image, path, name } = useCardBrandMark(props)
</script>
