<template>
	<template v-for="(part, index) in parts" :key="index">
		<ins v-if="part.type === 'added'" :class="[wordClass, 'base-text-diff__word--added']">{{ part.text }}</ins>
		<del v-else-if="part.type === 'removed'" :class="[wordClass, 'base-text-diff__word--removed']">{{ part.text }}</del>
		<template v-else>{{ part.text }}</template>
	</template>
</template>

<script setup lang="ts">
import type { TextDiffTextProps } from '../types/TextDiffText.types'

defineProps<TextDiffTextProps>()
</script>
