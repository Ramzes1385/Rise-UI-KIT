<template>
	<div
		class="base-prompt-input"
		:class="[variantClass, classes.root, { 'base-prompt-input--error': Boolean(error), 'base-prompt-input--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rowsStyle]">
		<label v-if="label" class="base-prompt-input__label" :class="classes.label" :for="controlId">{{ label }}</label>
		<div class="base-prompt-input__box" :class="classes.box">
			<textarea
				:id="controlId"
				ref="controlRef"
				class="base-prompt-input__control"
				:class="classes.control"
				:value="text"
				:name="name"
				:rows="rows"
				:maxlength="maxlength"
				:placeholder="placeholder ?? UI_AI.PROMPT_PLACEHOLDER"
				:disabled="isDisabled"
				enterkeyhint="send"
				v-bind="controlAttrs"
				@input="handleInput"
				@keydown="handleKeydown"></textarea>
			<div class="base-prompt-input__toolbar" :class="classes.toolbar">
				<div v-if="$slots.start" class="base-prompt-input__start"><slot name="start" /></div>
				<div class="base-prompt-input__end">
					<slot name="end" />
					<BaseButton
						v-if="isGenerating"
						class="base-prompt-input__button base-prompt-input__button--stop"
						:aria-label="UI_AI.STOP"
						:is-disabled="isDisabled"
						:size-scale="sizeScale"
						@click="stop">
						<BaseIcon name="stop" />
					</BaseButton>
					<BaseButton
						v-else
						class="base-prompt-input__button"
						:aria-label="UI_AI.SEND"
						:is-disabled="!canSubmit"
						:size-scale="sizeScale"
						@click="submit">
						<BaseIcon name="send" />
					</BaseButton>
				</div>
			</div>
		</div>
		<p v-if="error" :id="errorId" class="base-prompt-input__error" :class="classes.error">{{ error }}</p>
		<span :id="hintId" class="base-prompt-input__hint">{{ UI_AI.PROMPT_HINT }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BasePromptInput.style.scss'
import { UI_AI } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { useBasePromptInput } from '../model/useBasePromptInput'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BasePromptInputEmits, BasePromptInputProps, BasePromptInputSlots } from '../types/BasePromptInput.types'

const props = withDefaults(defineProps<BasePromptInputProps>(), {
	modelValue: undefined,
	placeholder: undefined,
	isDisabled: false,
	isGenerating: false,
	rows: 1,
	maxRows: 8,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BasePromptInputEmits>()

defineSlots<BasePromptInputSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rowsStyle,
	controlId,
	controlRef,
	controlAttrs,
	errorId,
	hintId,
	text,
	canSubmit,
	submit,
	stop,
	handleInput,
	handleKeydown,
} = useBasePromptInput(props, emit)
</script>
