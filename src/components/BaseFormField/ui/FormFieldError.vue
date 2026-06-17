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
import type { FormFieldErrorProps } from '../model/FormFieldError.types'

defineProps<FormFieldErrorProps>()
</script>
