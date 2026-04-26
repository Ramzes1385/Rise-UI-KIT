<template>
	<div class="home-page">
		<section class="home-page__hero">
			<div class="home-page__hero-container">
				<h1 class="home-page__hero-title">Искусство в металле</h1>
				<p class="home-page__hero-text">Эксклюзивные картины ручной работы для ценителей стиля и качества.</p>
				<BaseButton variant="primary" @click="$router.push({ name: 'catalog' })"> Смотреть каталог </BaseButton>
			</div>
		</section>

		<section class="home-page__features">
			<div class="home-page__container">
				<h2 class="home-page__subtitle">Почему выбирают нас</h2>
				<div class="home-page__features-grid">
					<BaseCard title="Качество" subtitle="Используем только высококачественную сталь" is-hoverable />
					<BaseCard title="Уникальность" subtitle="Каждая работа имеет свой характер" is-hoverable />
					<BaseCard title="Доставка" subtitle="Надежная упаковка и быстрая доставка" is-hoverable />
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseCard } from '@/shared/ui/BaseCard'
import './HomePage.style.scss'
</script>
