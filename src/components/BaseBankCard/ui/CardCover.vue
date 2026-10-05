<template>
	<span class="card-cover" aria-hidden="true">
		<span class="card-cover__layer">
			<slot>
				<img v-if="image" class="card-cover__image" :src="image" alt="" decoding="async" @error="handleImageError" />
				<span v-else-if="fillStyle" class="card-cover__fill" :style="fillStyle" />
			</slot>
		</span>
		<span v-if="hasOverlay" class="card-cover__overlay" />
	</span>
</template>

<script setup lang="ts">
import '../styles/CardCover.style.scss'
import { useCardCover } from '../model/useCardCover'
import type { CardCoverProps, CardCoverSlots } from '../types/cardCover.types'

const props = defineProps<CardCoverProps>()

defineSlots<CardCoverSlots>()

const { image, fillStyle, handleImageError } = useCardCover(props)
</script>
