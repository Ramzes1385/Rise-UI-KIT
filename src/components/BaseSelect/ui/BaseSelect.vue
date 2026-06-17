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
import { BaseBadge } from '@components/BaseBadge'
import { BaseDropdown } from '@components/BaseDropdown'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import { computed, ref } from 'vue'
import '../styles/BaseSelect.style.scss'
import type { BaseSelectEmits, BaseSelectOption, BaseSelectProps } from '../model/BaseSelect.types'
import BaseSelectDropdown from './BaseSelectDropdown.vue'

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

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

const isOpen = ref(false)
const searchQuery = ref('')
const selectRef = ref<HTMLDivElement | null>(null)

const selectedOption = computed(() => {
	return props.options.find(opt => opt.value === props.modelValue) ?? null
})

const selectedLabel = computed(() => {
	return selectedOption.value?.label ?? ''
})

const selectedItems = computed((): BaseSelectOption[] => {
	const values = props.modelValue
	if (!Array.isArray(values)) return []
	return props.options.filter(opt => values.includes(opt.value))
})

const selectedLabels = computed((): string[] => selectedItems.value.map(opt => opt.label))

const filteredOptions = computed(() => {
	if (!searchQuery.value) return props.options
	const query = searchQuery.value.toLowerCase()
	return props.options.filter(opt => {
		const matchLabel = opt.label.toLowerCase().includes(query)
		const matchDesc = opt.description ? opt.description.toLowerCase().includes(query) : false
		return matchLabel || matchDesc
	})
})

function toggleDropdown(): void {
	if (!props.isDisabled) {
		isOpen.value = !isOpen.value
		if (!isOpen.value) {
			searchQuery.value = ''
		}
	}
}

function handleClose(): void {
	searchQuery.value = ''
	formField.onBlur()
}

function isSelected(value: string | number): boolean {
	if (props.isMultiple) {
		return Array.isArray(props.modelValue) && props.modelValue.includes(value)
	}
	return props.modelValue === value
}

function handleSelect(option: BaseSelectOption): void {
	if (option.isDisabled) return

	if (props.isMultiple) {
		/* istanbul ignore next — defensive: при isMultiple modelValue гарантированно массив */
		const newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
		const index = newValue.indexOf(option.value)
		if (index > -1) {
			newValue.splice(index, 1)
		} else {
			newValue.push(option.value)
		}
		emit('update:modelValue', newValue)
		emit('change', newValue)
	} else {
		emit('update:modelValue', option.value)
		emit('change', option.value)
		isOpen.value = false
		searchQuery.value = ''
	}
}

function removeValue(value: string | number): void {
	if (!Array.isArray(props.modelValue)) return
	const targetValue = resolveOptionValue(value)
	const newValue = props.modelValue.filter(v => v !== targetValue)
	emit('update:modelValue', newValue)
	emit('change', newValue)
}

function resolveOptionValue(value: string | number): string | number {
	if (props.options.some(opt => opt.value === value)) return value
	const byLabel = props.options.find(opt => opt.label === value)
	return byLabel ? byLabel.value : value
}

defineExpose({
	selectRef,
	focus: () => selectRef.value?.focus(),
	blur: () => selectRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
