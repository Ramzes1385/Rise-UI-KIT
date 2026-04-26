<template>
	<section class="painting-list">
		<div class="painting-list__container">
			<h2 class="painting-list__title">Наши работы</h2>
			<div class="painting-list__grid">
				<PaintingCard
					v-for="painting in paintings"
					:key="painting.id"
					:painting="painting"
					@order="$emit('order', $event)" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Painting } from '@/entities/Painting'
import { PaintingCard } from '@/entities/Painting'
import './PaintingList.style.scss'

defineProps<{
	paintings: Painting[]
}>()

defineEmits<{
	(event: 'order', painting: Painting): void
}>()
</script>
