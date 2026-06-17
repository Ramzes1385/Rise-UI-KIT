<template>
	<BaseText
		:tag="tag"
		:class="className"
		:custom-class="customClass"
		:size-scale="sizeScale">
		{{ label }}<span v-if="isRequired" :class="[requiredClassName, requiredCustomClass]">*</span>
	</BaseText>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'

withDefaults(defineProps<{
	label: string
	tag?: string
	isRequired?: boolean
	className?: string
	customClass?: string | Record<string, string | undefined>
	requiredClassName?: string
	requiredCustomClass?: string | Record<string, string | undefined>
	sizeScale?: number
}>(), {
	tag: 'label',
	isRequired: undefined,
	className: undefined,
	customClass: undefined,
	requiredClassName: undefined,
	requiredCustomClass: undefined,
	sizeScale: undefined,
})
</script>
