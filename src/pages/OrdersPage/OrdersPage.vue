<template>
	<div class="orders-page">
		<div class="orders-page__container">
			<h1 class="orders-page__title">Мои заказы</h1>
			<div class="orders-page__list">
				<div v-for="order in orders" :key="order.id" class="orders-page__item">
					<div class="orders-page__item-header">
						<span class="orders-page__item-number">Заказ №{{ order.id }}</span>
						<span class="orders-page__item-status">{{ order.status }}</span>
					</div>
					<div class="orders-page__item-body">
						<p><strong>Картина:</strong> {{ order.paintingTitle }}</p>
						<p><strong>Сумма:</strong> {{ order.price.toLocaleString() }} ₽</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './OrdersPage.style.scss'

const orders = ref([
	{ id: 101, paintingTitle: 'Индустриальный лев', price: 15000, status: 'В обработке' },
	{ id: 98, paintingTitle: 'Геометрический олень', price: 12000, status: 'Доставлен' },
])
</script>
