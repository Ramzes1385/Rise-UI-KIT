<template>
	<div class="painting-page">
		<div v-if="painting" class="painting-page__container">
			<div class="painting-page__grid">
				<div class="painting-page__image-wrapper">
					<img :src="painting.imageUrl" :alt="painting.title" class="painting-page__image" />
				</div>

				<div class="painting-page__info">
					<h1 class="painting-page__title">{{ painting.title }}</h1>
					<p class="painting-page__price">{{ painting.price.toLocaleString() }} ₽</p>

					<div class="painting-page__description">
						<h2 class="painting-page__subtitle">Описание</h2>
						<p>{{ painting.description }}</p>
					</div>

					<div class="painting-page__specs">
						<h2 class="painting-page__subtitle">Характеристики</h2>
						<ul class="painting-page__specs-list">
							<li><strong>Материал:</strong> {{ painting.material }}</li>
							<li><strong>Размер:</strong> {{ painting.size }}</li>
						</ul>
					</div>

					<BaseButton variant="primary" @click="isOrderModalOpen = true"> Заказать картину </BaseButton>
				</div>
			</div>
		</div>
		<div v-else class="painting-page__loading">Загрузка...</div>

		<BaseModal :is-open="isOrderModalOpen" title="Оформление заказа" @close="isOrderModalOpen = false">
			<OrderForm v-if="painting" :painting="painting" @submit="handleOrderSubmit" @cancel="isOrderModalOpen = false" />
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
import type { Painting } from '@/entities/Painting'
import { usePaintingStore } from '@/entities/Painting'
import { OrderForm } from '@/features/OrderForm'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseModal } from '@/shared/ui/BaseModal'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import './PaintingPage.style.scss'

const route = useRoute()
const paintingStore = usePaintingStore()
const isOrderModalOpen = ref(false)

if (paintingStore.items.length === 0) {
	paintingStore.fetchItems()
}

const painting = computed<Painting | null>(() => {
	const id = Number(route.params.id)
	return paintingStore.getById(id) || null
})

function handleOrderSubmit(data: any): void {
	console.log('Order submitted:', data)
	alert('Спасибо за заявку!')
	isOrderModalOpen.value = false
}
</script>
