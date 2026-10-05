<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root, { 'base-mention--error': Boolean(error), 'base-mention--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:for-id="controlId"
			:label="label"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div :class="ui('field')">
			<textarea
				:id="controlId"
				ref="controlRef"
				:class="[ui('control'), classes.control]"
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
			<Transition name="base-mention-popup" :css="!isMotionReduced">
				<div v-if="isOpen" :class="[ui('popup'), classes.list]">
					<ul v-if="suggestions.length" :id="listId" :class="ui('list')" role="listbox" :aria-label="UI_MENTION.LIST">
						<li
							v-for="(option, index) in suggestions"
							:id="optionId(index)"
							:key="option.value"
							:class="[ui('option'), { 'base-mention__option--active': index === activeIndex }]"
							role="option"
							:aria-selected="index === activeIndex ? 'true' : 'false'"
							@mousedown.prevent
							@click="select(option)">
							<img v-if="option.avatar" :class="ui('avatar')" :src="option.avatar" alt="" />
							<span v-else :class="[ui('avatar'), 'base-mention__avatar--initial']" aria-hidden="true">{{
								option.label.charAt(0)
							}}</span>
							<span :class="ui('option-text')">
								<span :class="ui('option-label')">{{ option.label }}</span>
								<span :class="ui('option-value')">{{ trigger }}{{ option.value }}</span>
							</span>
							<span v-if="option.description" :class="ui('option-description')">{{ option.description }}</span>
						</li>
					</ul>
					<p v-else :id="listId" :class="ui('empty')" role="status">{{ UI_MENTION.EMPTY }}</p>
				</div>
			</Transition>
		</div>
		<FormFieldError
			v-if="error"
			:id="errorId"
			:error="error"
			:class-name="ui('error')"
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
	ui,
	rootRef,
	isMotionReduced,
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
