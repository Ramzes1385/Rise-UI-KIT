<template>
	<div
		ref="rootRef"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			ui('root'),
			{
				'base-form-field--error': error,
			},
			variantClass,
			classes.root,
		]">
		<div v-if="label" :class="[ui('header'), classes.header]">
			<label :id="labelId" :for="controlId" :class="[ui('label'), classes.label]"
				>{{ label }}<span v-if="isRequired" :class="[ui('required'), classes.required]" aria-hidden="true">*</span></label
			>
		</div>

		<div
			:class="[ui('content'), classes.content]"
			:role="isGroup ? 'group' : undefined"
			:aria-labelledby="isGroup ? labelId : undefined"
			:aria-describedby="isGroup ? describedBy : undefined">
			<slot />
		</div>

		<div v-if="description" class="base-form-field__message" :class="{ 'base-form-field__message--open': !error }">
			<div class="base-form-field__message-body">
				<Transition name="base-form-field-message">
					<p v-if="!error" :id="descriptionId" :class="[ui('description'), classes.description]">
						{{ description }}
					</p>
				</Transition>
			</div>
		</div>

		<div class="base-form-field__message" :class="[{ 'base-form-field__message--open': error }, classes.animation]">
			<div class="base-form-field__message-body">
				<Transition name="base-form-field-message">
					<p v-if="error" :id="errorId" role="alert" :class="[ui('error'), classes.error]">
						{{ error }}
					</p>
				</Transition>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFormField.style.scss'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseFormField } from '../model/useBaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFormFieldProps, BaseFormFieldSlots } from '../types/BaseFormField.types'

const props = withDefaults(
	defineProps<BaseFormFieldProps>(),
	kitDefaults('BaseFormField', {
		variant: DEFAULT_VARIANT,
		isRequired: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseFormFieldSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	labelId,
	descriptionId,
	errorId,
	error,
	describedBy,
	controlId,
	isGroup,
	exposed,
} = useBaseFormField(props)

defineExpose(exposed)
</script>
