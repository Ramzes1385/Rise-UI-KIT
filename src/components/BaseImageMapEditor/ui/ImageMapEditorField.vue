<template>
	<BaseInput
		v-if="field.kind === 'text'"
		:model-value="shown"
		:label="field.label"
		:placeholder="field.placeholder"
		:error="field.error || undefined"
		:is-disabled="isDisabled"
		@update:model-value="input"
		@blur="blur" />
	<div v-else-if="field.kind === 'color'" class="base-image-map-editor__color">
		<BaseSelect
			:model-value="tokenValue"
			:label="tokenLabel"
			:options="field.options ?? []"
			:is-disabled="isDisabled"
			@update:model-value="pickToken(String($event ?? ''))" />
		<div class="base-image-map-editor__color-row">
			<BaseInput
				:model-value="shown"
				:label="field.label"
				:placeholder="field.placeholder"
				:is-disabled="isDisabled"
				@update:model-value="input"
				@blur="blur" />
			<BaseColorPicker
				:model-value="shown || field.placeholder || ''"
				:palettes="palettes"
				:aria-label="field.label"
				is-presets-hidden
				is-recent-hidden
				:is-disabled="isDisabled"
				@update:model-value="input" />
		</div>
	</div>
	<BaseTextarea
		v-else-if="field.kind === 'textarea'"
		:model-value="field.value as string"
		:label="field.label"
		:rows="3"
		is-autosize
		:error="field.error || undefined"
		:is-disabled="isDisabled"
		@update:model-value="emit('update', $event ?? '')" />
	<BaseSelect
		v-else-if="field.kind === 'select'"
		:model-value="field.value as string"
		:label="field.label"
		:options="field.options ?? []"
		:is-disabled="isDisabled"
		@update:model-value="emit('update', String($event ?? ''))" />
	<BaseInputNumber
		v-else-if="field.kind === 'number'"
		:model-value="typeof field.value === 'number' ? field.value : null"
		:label="field.label"
		:min="field.min"
		:max="field.max"
		:precision="field.precision ?? 2"
		:error="field.error || undefined"
		:is-disabled="isDisabled"
		@update:model-value="emit('update', $event ?? null)" />
	<BaseSwitch
		v-else-if="field.kind === 'switch'"
		:model-value="field.value as boolean"
		:label="field.label"
		:is-disabled="isDisabled"
		@update:model-value="emit('update', Boolean($event))" />
	<BaseInputTags
		v-else
		:model-value="field.value as string[]"
		:label="field.label"
		:is-disabled="isDisabled"
		@update:model-value="emit('update', $event ?? [])" />
</template>

<script setup lang="ts">
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseInputTags } from '@components/BaseInputTags'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseInputNumber } from '@components/BaseInputNumber'
import { useImageMapEditorField } from '../model/panel/field/useImageMapEditorField'
import type { ImageMapEditorFieldEmits, ImageMapEditorFieldProps } from '../types/ImageMapEditorField.types'

const props = defineProps<ImageMapEditorFieldProps>()

const emit = defineEmits<ImageMapEditorFieldEmits>()

const { shown, tokenValue, tokenLabel, palettes, input, pickToken, blur } = useImageMapEditorField(props, emit)
</script>
