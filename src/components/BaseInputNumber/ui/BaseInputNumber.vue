<template>
	<BaseInput
		ref="inputRef"
		class="base-input-number"
		:class="[{ 'base-input-number--controls': showControls }, classes.root]"
		:model-value="draft"
		:variant="variant"
		:label="label"
		:placeholder="placeholder"
		:error="error"
		:is-disabled="isControlDisabled"
		:is-readonly="isReadonly"
		:is-required="isRequired"
		:aria-label="ariaLabel"
		:input-attrs="spinbuttonAttrs"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field }"
		@update:model-value="handleInput"
		@keydown="handleKeydown"
		@blur="handleBlur"
		@focus="handleFocus">
		<template v-if="showControls" #prefix>
			<button
				type="button"
				class="base-input-number__button"
				:class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_DECREASE"
				:disabled="isControlDisabled || isAtMin"
				@mousedown.prevent
				@click="stepBy(-1)">
				<BaseIcon name="minus" :size-scale="calcIconScale('sm', sizeScale)" />
			</button>
		</template>
		<template v-if="showControls" #postfix>
			<button
				type="button"
				class="base-input-number__button"
				:class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_INCREASE"
				:disabled="isControlDisabled || isAtMax"
				@mousedown.prevent
				@click="stepBy(1)">
				<BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" />
			</button>
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import '../styles/BaseInputNumber.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseInputNumber } from '../model/useBaseInputNumber'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseInputNumberEmits, BaseInputNumberProps } from '../types/BaseInputNumber.types'

const props = withDefaults(
	defineProps<BaseInputNumberProps>(),
	kitDefaults('BaseInputNumber', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		step: 1,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		hasControls: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseInputNumberEmits>()

const {
	inputRef,
	exposed,
	classes,
	isControlDisabled,
	showControls,
	isAtMin,
	isAtMax,
	draft,
	spinbuttonAttrs,
	stepBy,
	handleInput,
	handleKeydown,
	handleFocus,
	handleBlur,
} = useBaseInputNumber(props, emit)

defineExpose(exposed)
</script>
