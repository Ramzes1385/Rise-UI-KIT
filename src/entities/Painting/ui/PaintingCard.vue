<template>
	<BaseCard class="painting-card" is-hoverable @click="$router.push({ name: 'painting', params: { id: painting.id } })">
		<div class="painting-card__image-wrapper">
			<img :src="painting.imageUrl" :alt="painting.title" class="painting-card__image" />
		</div>

		<div class="painting-card__info">
			<h3 class="painting-card__title">{{ painting.title }}</h3>
			<p class="painting-card__description">{{ painting.description }}</p>

			<div class="painting-card__details">
				<span class="painting-card__detail">Материал: {{ painting.material }}</span>
				<span class="painting-card__detail">Размер: {{ painting.size }}</span>
			</div>
		</div>

		<template #footer>
			<div class="painting-card__footer">
				<span class="painting-card__price">{{ painting.price.toLocaleString() }} ₽</span>
				<BaseButton variant="primary" @click.stop="handleOrder"> Заказать </BaseButton>
			</div>
		</template>
	</BaseCard>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseCard } from '@/shared/ui/BaseCard'
import './PaintingCard.style.scss'
import type { PaintingCardEmits, PaintingCardProps } from './PaintingCard.types'

const props = defineProps<PaintingCardProps>()
const emit = defineEmits<PaintingCardEmits>()

/** Обработка заказа */
function handleOrder(): void {
	emit('order', props.painting)
}
</script>
