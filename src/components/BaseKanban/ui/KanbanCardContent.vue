<template>
	<span class="base-kanban__card-title">{{ card.title }}</span>
	<span v-if="card.description" class="base-kanban__card-description">{{ card.description }}</span>
	<span v-if="card.tags?.length" class="base-kanban__tags">
		<span v-for="tag in card.tags" :key="tag" class="base-kanban__tag">{{ tag }}</span>
	</span>
</template>

<script setup lang="ts">
import type { KanbanCardContentProps } from '../types/KanbanParts.types'

defineProps<KanbanCardContentProps>()
</script>
