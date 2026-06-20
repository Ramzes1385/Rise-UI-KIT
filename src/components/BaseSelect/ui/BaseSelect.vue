<template>
	<BaseDropdown
		v-model:is-open="isOpen"
		position="bottom-start"
		:match-width="true"
		:size-scale="sizeScale"
		:padding="0"
		:custom-class="classes.dropdown"
		@close="handleClose">
		<div
			class="base-select"
			:class="[
				variantClass,
				{
					'base-select--open': isOpen,
					'base-select--disabled': isDisabled,
					'base-select--error': formField.error,
					'base-select--multiple': isMultiple,
				},
				classes.root,
			]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:label="label"
			:is-required="isRequired"
			class-name="base-select__label"
			:custom-class="classes.label"
			required-class-name="base-select__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div
			ref="selectRef"
			class="base-select__trigger"
			:class="classes.trigger"
			:tabindex="isDisabled ? -1 : 0"
				@click="toggleDropdown"
				@keydown.enter.prevent="toggleDropdown"
				@keydown.space.prevent="toggleDropdown">
				<slot name="trigger" :is-open="isOpen" :selected-label="selectedLabel" :selected-labels="selectedLabels">
					<div class="base-select__values" :class="classes.values">
						<template v-if="isMultiple && Array.isArray(modelValue) && modelValue.length > 0">
							<template v-if="$slots.tag">
								<slot name="tag" :labels="selectedLabels" :items="selectedItems" :remove="removeValue" />
							</template>
							<template v-else>
								<BaseBadge
									v-for="item in selectedItems"
									:key="item.value"
									class="base-select__tag"
									:custom-class="classes.tag"
									:size-scale="sizeScale">
									<BaseText
										tag="span"
										class="base-select__tag-text"
										:custom-class="classes.tagText"
										:size-scale="sizeScale"
										>{{ item.label }}</BaseText
									>
									<BaseIcon
										class="base-select__tag-close"
										:custom-class="classes.tagClose"
										name="x-mark"
										:size-scale="calcIconScale('xs', sizeScale)"
										@click.stop="removeValue(item.value)" />
								</BaseBadge>
							</template>
						</template>
						<template v-else-if="isMultiple && (!Array.isArray(modelValue) || modelValue.length === 0)">
							<BaseText
								tag="span"
								class="base-select__placeholder"
								:custom-class="classes.placeholder"
								:size-scale="sizeScale"
								>{{ placeholder }}</BaseText
							>
						</template>
						<template v-else-if="!isMultiple && selectedOption">
							<slot name="selected" :option="selectedOption">
								<BaseText
									v-if="selectedOption.icon"
									tag="span"
									class="base-select__icon"
									:custom-class="classes.icon"
									:size-scale="sizeScale"
									>{{ selectedOption.icon }}</BaseText
								>
								<BaseText
									tag="span"
									class="base-select__value-text"
									:custom-class="classes.valueText"
									:size-scale="sizeScale"
									>{{ selectedLabel }}</BaseText
								>
							</slot>
						</template>
						<template v-else>
							<BaseText
								tag="span"
								class="base-select__placeholder"
								:custom-class="classes.placeholder"
								:size-scale="sizeScale"
								>{{ placeholder }}</BaseText
							>
						</template>
					</div>
				</slot>
				<BaseIcon
					class="base-select__arrow"
					:custom-class="classes.arrow"
					name="chevron-down"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</div>

		<FormFieldError
			:error="formField.error"
			class-name="base-select__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
		</div>

		<template #dropdown>
			<BaseSelectDropdown
				v-model:search-query="searchQuery"
				:filtered-options="filteredOptions"
				:is-searchable="isSearchable"
				:is-multiple="isMultiple"
				:size-scale="sizeScale"
				:is-selected="isSelected"
				:classes="classes"
				:size-scale-style="sizeScaleStyle"
				@select="handleSelect">
				<template #header>
					<slot name="header" />
				</template>
				<template #option="slotProps">
					<slot name="option" v-bind="slotProps" />
				</template>
				<template #empty>
					<slot name="empty" />
				</template>
				<template #footer>
					<slot name="footer" />
				</template>
			</BaseSelectDropdown>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseBadge } from '@components/BaseBadge'
import { BaseDropdown } from '@components/BaseDropdown'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { useSelect } from '@composables/useSelect'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import '../styles/BaseSelect.style.scss'
import { calcIconScale } from '@utils/iconUtils'
import BaseSelectDropdown from './BaseSelectDropdown.vue'
import type { BaseSelectEmits, BaseSelectProps, BaseSelectSlots } from '../model/BaseSelect.types'

const props = withDefaults(defineProps<BaseSelectProps>(), {
	modelValue: '',
	placeholder: UI_TEXT.SELECT_PLACEHOLDER,
	label: '',
	isRequired: false,
	isMultiple: false,
	isSearchable: false,
	isDisabled: false,
	error: '',
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-select', props, [
		'root',
		'dropdown',
		'label',
		'required',
		'trigger',
		'values',
		'tag',
		'tagText',
		'tagClose',
		'placeholder',
		'icon',
		'valueText',
		'arrow',
		'errorText',
		'dropdownContent',
		'search',
		'searchInput',
		'options',
		'option',
		'checkbox',
		'optionIcon',
		'optionContent',
		'optionLabel',
		'optionDesc',
		'noResults',
	])

const emit = defineEmits<BaseSelectEmits>()
defineSlots<BaseSelectSlots>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

const selectRef = ref<HTMLDivElement | null>(null)

const {
	isOpen,
	searchQuery,
	selectedOption,
	selectedLabel,
	selectedItems,
	selectedLabels,
	filteredOptions,
	toggleDropdown,
	handleClose,
	isSelected,
	handleSelect,
	removeValue,
} = useSelect({
	props,
	emit,
	onBlur: formField.onBlur,
})

defineExpose({
	rootRef: selectRef,
	selectRef,
	focus: () => selectRef.value?.focus(),
	blur: () => selectRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
