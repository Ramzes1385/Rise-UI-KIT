<template>
	<div
		v-if="label.draft.value"
		:ref="label.focus"
		class="base-flow-map__edit-label"
		:style="label.style.value"
		@keydown.capture="label.onKeydown"
		@focusout="label.save">
		<BaseTextarea
			v-if="label.draft.value.isMultiline"
			v-model="label.value.value"
			:aria-label="label.ariaLabel"
			:rows="2"
			is-autosize />
		<BaseInput v-else v-model="label.value.value" :aria-label="label.ariaLabel" />
	</div>
</template>

<script setup lang="ts">
import { BaseInput } from '@components/BaseInput'
import { BaseTextarea } from '@components/BaseTextarea'
import { useFlowEditLabel } from '../../../model/edit/overlay/useFlowEditLabel'

const label = useFlowEditLabel()
</script>
