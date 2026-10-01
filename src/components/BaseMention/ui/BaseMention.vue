<template>
	<div
		class="base-mention"
		:class="[variantClass, classes.root, { 'base-mention--error': Boolean(error), 'base-mention--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:for-id="controlId"
			:label="label"
			class-name="base-mention__label"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div class="base-mention__field">
			<textarea
				:id="controlId"
				ref="controlRef"
				class="base-mention__control"
				:class="classes.control"
				:value="text"
				:rows="rows"
				:placeholder="placeholder"
				:disabled="isDisabled"
				aria-autocomplete="list"
				:aria-controls="isOpen ? listId : undefined"
				:aria-activedescendant="isOpen && suggestions.length ? optionId(activeIndex) : undefined"
				v-bind="controlAria"
				@input="handleInput"
				@keydown="handleKeydown"
				@keyup="detect"
				@click="detect"
				@blur="close"></textarea>
			<div v-if="isOpen" class="base-mention__popup" :class="classes.list">
				<ul v-if="suggestions.length" :id="listId" class="base-mention__list" role="listbox" :aria-label="UI_MENTION.LIST">
					<li
						v-for="(option, index) in suggestions"
						:id="optionId(index)"
						:key="option.value"
						class="base-mention__option"
						:class="{ 'base-mention__option--active': index === activeIndex }"
						role="option"
						:aria-selected="index === activeIndex ? 'true' : 'false'"
						@mousedown.prevent
						@click="select(option)">
						<img v-if="option.avatar" class="base-mention__avatar" :src="option.avatar" alt="" />
						<span v-else class="base-mention__avatar base-mention__avatar--initial" aria-hidden="true">{{
							option.label.charAt(0)
						}}</span>
						<span class="base-mention__option-text">
							<span class="base-mention__option-label">{{ option.label }}</span>
							<span class="base-mention__option-value">{{ trigger }}{{ option.value }}</span>
						</span>
						<span v-if="option.description" class="base-mention__option-description">{{ option.description }}</span>
					</li>
				</ul>
				<p v-else :id="listId" class="base-mention__empty" role="status">{{ UI_MENTION.EMPTY }}</p>
			</div>
		</div>
		<FormFieldError
			v-if="error"
			:id="errorId"
			:error="error"
			class-name="base-mention__error"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMention.style.scss'
import { UI_MENTION } from '@/locales/messages'
import { useBaseMention } from '../model/useBaseMention'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import type { BaseMentionEmits, BaseMentionProps } from '../types/BaseMention.types'

const props = withDefaults(defineProps<BaseMentionProps>(), {
	modelValue: undefined,
	options: () => [],
	trigger: '@',
	maxSuggestions: 8,
	rows: 3,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseMentionEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	controlId,
	controlRef,
	controlAria,
	errorId,
	text,
	listId,
	suggestions,
	activeIndex,
	isOpen,
	optionId,
	select,
	detect,
	close,
	handleInput,
	handleKeydown,
} = useBaseMention(props, emit)
</script>
