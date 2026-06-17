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
import type { FormFieldLabelProps } from '../model/FormFieldLabel.types'

withDefaults(defineProps<FormFieldLabelProps>(), {
	tag: 'label',
	isRequired: undefined,
	className: undefined,
	customClass: undefined,
	requiredClassName: undefined,
	requiredCustomClass: undefined,
	sizeScale: undefined,
})
</script>
