<template>
	<div class="catalog-page">
		<div class="catalog-page__container">
			<h1 class="catalog-page__title">Каталог картин</h1>

			<div v-if="paintingStore.isLoading" class="catalog-page__loading">
				<BaseSkeleton v-for="i in 4" :key="i" height="400px" />
			</div>

			<div v-else-if="paintingStore.error" class="catalog-page__error">
				<BaseNotification title="Ошибка" :description="paintingStore.error" type="error" />
				<BaseButton type="button" variant="outline" @click="paintingStore.fetchItems()"> Попробовать снова </BaseButton>
			</div>

			<PaintingList v-else :paintings="paintings" @order="handleOpenOrder" />
		</div>

		<BaseModal :is-open="isOrderModalOpen" title="Оформление заказа" @close="isOrderModalOpen = false">
			<OrderForm :painting="selectedPainting" @submit="handleOrderSubmit" @cancel="isOrderModalOpen = false" />
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
import type { Painting } from '@/entities/Painting'
import { usePaintingStore } from '@/entities/Painting'
import { OrderForm } from '@/features/OrderForm'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseModal } from '@/shared/ui/BaseModal'
import { BaseNotification } from '@/shared/ui/BaseNotification'
import { BaseSkeleton } from '@/shared/ui/BaseSkeleton'
import { PaintingList } from '@/widgets/PaintingList'
import { computed, ref } from 'vue'
import './CatalogPage.style.scss'

const paintingStore = usePaintingStore()
const isOrderModalOpen = ref(false)
const selectedPainting = ref<Painting | null>(null)
const paintings = computed(() => paintingStore.items)

paintingStore.fetchItems()

function handleOpenOrder(painting: Painting): void {
	selectedPainting.value = painting
	isOrderModalOpen.value = true
}

function handleOrderSubmit(data: any): void {
	console.log('Order submitted:', data)
	alert('Спасибо за заявку!')
	isOrderModalOpen.value = false
}
</script>
