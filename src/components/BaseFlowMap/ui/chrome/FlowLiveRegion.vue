<template>
	<div class="base-flow-map__sr" role="status" aria-live="polite" aria-atomic="true">{{ text }}</div>
</template>

<script setup lang="ts">
defineProps<{ text: string }>()
</script>
