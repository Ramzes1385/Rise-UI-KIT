<template>
	<BaseInput
		ref="inputRef"
		:class="[ui('root'), { 'base-input-number--controls': showControls }, classes.root]"
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
		:ui="inputUi"
		@update:model-value="handleInput"
		@keydown="handleKeydown"
		@blur="handleBlur"
		@focus="handleFocus">
		<template v-if="showControls" #prefix>
			<BaseButton
				variant="ghost"
				:class="ui('button')"
				:custom-class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_DECREASE"
				:is-disabled="isControlDisabled || isAtMin"
				:size-scale="sizeScale"
				@mousedown.prevent
				@click="stepBy(-1)">
				<BaseIcon name="minus" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
		</template>
		<template v-if="showControls" #postfix>
			<BaseButton
				variant="ghost"
				:class="ui('button')"
				:custom-class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_INCREASE"
				:is-disabled="isControlDisabled || isAtMax"
				:size-scale="sizeScale"
				@mousedown.prevent
				@click="stepBy(1)">
				<BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import '../styles/BaseInputNumber.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseInputNumber } from '../model/useBaseInputNumber'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
	ui,
	inputUi,
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
