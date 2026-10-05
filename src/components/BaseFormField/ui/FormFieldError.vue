<template>
	<Transition name="base-form-field-error">
		<BaseText v-if="error" :id="id" tag="span" :class="className" :custom-class="customClass" :size-scale="sizeScale">{{
			error
		}}</BaseText>
	</Transition>
</template>

<script setup lang="ts">
import '../styles/FormFieldError.style.scss'
import { BaseText } from '@components/BaseText'
import type { FormFieldErrorProps } from '../types/FormFieldError.types'

defineProps<FormFieldErrorProps>()
</script>
