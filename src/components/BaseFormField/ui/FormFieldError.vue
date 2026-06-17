<template>
	<BaseText
		v-if="error"
		tag="span"
		:class="className"
		:custom-class="customClass"
		:size-scale="sizeScale"
		>{{ error }}</BaseText
	>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'

defineProps<{
	error: string
	className?: string
	customClass?: string | Record<string, string | undefined>
	sizeScale?: number
}>()
</script>
