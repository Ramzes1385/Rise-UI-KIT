<template>
	<div class="base-flow-map__edit-field">
		<BaseInput
			v-if="field.type === 'text'"
			v-model="state.draft.value"
			:label="field.label"
			:is-disabled="field.isDisabled"
			@blur="state.save"
			@keydown.enter="state.save" />
		<BaseTextarea
			v-else-if="field.type === 'area'"
			v-model="state.draft.value"
			:label="field.label"
			:rows="3"
			is-autosize
			@blur="state.save" />
		<BaseInputNumber
			v-else-if="field.type === 'number'"
			:model-value="Number(field.value ?? 0)"
			:label="field.label"
			@change="state.number" />
		<BaseSelect
			v-else-if="field.type === 'select'"
			:model-value="String(field.value ?? '')"
			:label="field.label"
			:options="state.options()"
			@change="state.commit($event as string)" />
		<BaseSwitch
			v-else-if="field.type === 'switch'"
			:model-value="Boolean(field.value)"
			:label="field.label"
			@update:model-value="state.commit" />
		<BaseSegmented
			v-else
			:model-value="String(field.value ?? '')"
			:label="field.label"
			:options="state.options()"
			@update:model-value="state.commit($event as string)" />
	</div>
</template>

<script setup lang="ts">
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseSegmented } from '@components/BaseSegmented'
import { BaseInputNumber } from '@components/BaseInputNumber'
import { useFlowEditField } from '../../../model/edit/inspector/useFlowEditField'
import type { FlowEditFieldDef } from '../../../types/internal/edit/flowEditApi.types'

const props = defineProps<{ field: FlowEditFieldDef }>()

const state = useFlowEditField(props)
</script>
