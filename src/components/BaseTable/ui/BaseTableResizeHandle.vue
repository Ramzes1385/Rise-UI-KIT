<template>
	<div class="base-table__resizer" @mousedown.stop="emit('resize-start', $event)" @click.stop></div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	(event: 'resize-start', value: MouseEvent): void
}>()
</script>
