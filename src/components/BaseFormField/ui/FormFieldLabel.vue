<template>
	<BaseText
		:tag="tag"
		:for="tag === 'label' ? forId : undefined"
		:class="className"
		:custom-class="customClass"
		:weight="TEXT_WEIGHT.MEDIUM"
		:size-scale="sizeScale">
		{{ label }}<span v-if="isRequired" :class="[requiredClassName, requiredCustomClass]" aria-hidden="true">*</span>
	</BaseText>
</template>

<script setup lang="ts">
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import type { FormFieldLabelProps } from '../types/FormFieldLabel.types'

withDefaults(defineProps<FormFieldLabelProps>(), {
	tag: 'label',
	forId: undefined,
	isRequired: undefined,
	className: undefined,
	customClass: undefined,
	requiredClassName: undefined,
	requiredCustomClass: undefined,
	sizeScale: undefined,
})
</script>
