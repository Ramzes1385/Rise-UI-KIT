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
			ref="selectRef"
			class="base-select"
			:class="[
				variantClass,
				{
					'base-select--open': isOpen,
					'base-select--disabled': isDisabled,
					'base-select--error': error,
					'base-select--multiple': isMultiple,
				},
				classes.root,
			]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<BaseText
				v-if="label"
				tag="label"
				class="base-select__label"
				:custom-class="classes.label"
				:size-scale="sizeScale">
				{{ label }}
				<BaseText
					v-if="isRequired"
					tag="span"
					class="base-select__required"
					:custom-class="classes.required"
					:size-scale="sizeScale"
					>*</BaseText
				>
			</BaseText>

			<div
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
								<slot name="tag" :labels="selectedLabels" :remove="removeValue" />
							</template>
							<template v-else>
								<BaseBadge
									v-for="val in selectedLabels"
									:key="val"
									class="base-select__tag"
									:custom-class="classes.tag"
									:size-scale="sizeScale">
									<BaseText
										tag="span"
										class="base-select__tag-text"
										:custom-class="classes.tagText"
										:size-scale="sizeScale"
										>{{ val }}</BaseText
									>
									<BaseIcon
										class="base-select__tag-close"
										:custom-class="classes.tagClose"
										name="x-mark"
										:size-scale="calcIconScale('xs', sizeScale)"
										@click.stop="removeValue(val)" />
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

			<BaseText
				v-if="error"
				tag="span"
				class="base-select__error-text"
				:custom-class="classes.errorText"
				:size-scale="sizeScale"
				>{{ error }}</BaseText
			>
		</div>

		<template #dropdown>
			<div class="base-select__dropdown-content" :class="classes.dropdownContent" :style="sizeScaleStyle">
				<div v-if="isSearchable" class="base-select__search" :class="classes.search">
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Поиск..."
						class="base-select__search-input"
						:class="classes.searchInput"
						@click.stop />
				</div>

				<slot name="header" />

				<ul class="base-select__options" :class="classes.options">
					<li
						v-for="option in filteredOptions"
						:key="option.value"
						class="base-select__option"
						:class="[
							{
								'base-select__option--selected': isSelected(option.value),
								'base-select__option--disabled': option.isDisabled,
								'base-select__option--with-desc': option.description,
							},
							classes.option,
						]"
						@click="handleSelect(option)">
						<slot name="option" :option="option" :is-selected="isSelected(option.value)">
							<span v-if="isMultiple" class="base-select__checkbox" :class="classes.checkbox">
								<BaseIcon v-if="isSelected(option.value)" name="check" :size-scale="calcIconScale('xs', sizeScale)" />
							</span>
							<BaseText
								v-if="option.icon"
								tag="span"
								class="base-select__option-icon"
								:custom-class="classes.optionIcon"
								:size-scale="sizeScale"
								>{{ option.icon }}</BaseText
							>
							<div class="base-select__option-content" :class="classes.optionContent">
								<BaseText
									tag="span"
									class="base-select__option-label"
									:custom-class="classes.optionLabel"
									:size-scale="sizeScale"
									>{{ option.label }}</BaseText
								>
								<BaseText
									v-if="option.description"
									tag="span"
									class="base-select__option-desc"
									:custom-class="classes.optionDesc"
									:size-scale="sizeScale"
									>{{ option.description }}</BaseText
								>
							</div>
						</slot>
					</li>
					<li v-if="filteredOptions.length === 0" class="base-select__no-results" :class="classes.noResults">
						<slot name="empty">
							<BaseText tag="span" :size-scale="sizeScale">Ничего не найдено</BaseText>
						</slot>
					</li>
				</ul>

				<slot name="footer" />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import './BaseSelect.style.scss'
import type { BaseSelectEmits, BaseSelectOption, BaseSelectProps } from './BaseSelect.types'

const props = defineProps({
	modelValue: { type: [String, Number, Array] as PropType<BaseSelectProps['modelValue']>, default: '' },
	options: { type: Array as PropType<BaseSelectProps['options']>, required: true },
	placeholder: { type: String, default: 'Выберите...' },
	label: { type: String, default: '' },
	isRequired: { type: Boolean, default: false },
	isMultiple: { type: Boolean, default: false },
	isSearchable: { type: Boolean, default: false },
	isDisabled: { type: Boolean, default: false },
	error: { type: String, default: '' },
	variant: { type: String as PropType<BaseSelectProps['variant']>, default: 'default' },
	color: Object as PropType<BaseSelectProps['color']>,
	sizeScale: { type: Number, default: 100 },
	customClass: [String, Object] as PropType<BaseSelectProps['customClass']>,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-select', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

const emit = defineEmits<BaseSelectEmits>()

const isOpen = ref(false)
const searchQuery = ref('')

const selectedOption = computed(() => {
	return props.options.find(opt => opt.value === props.modelValue) ?? null
})

const selectedLabel = computed(() => {
	const option = props.options.find(opt => opt.value === props.modelValue)
	return option ? option.label : ''
})

const selectedLabels = computed((): string[] => {
	const values = props.modelValue
	if (!Array.isArray(values)) return []
	return props.options.filter(opt => values.includes(opt.value)).map(opt => opt.label)
})

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

function removeValue(label: string): void {
	const option = props.options.find(opt => opt.label === label)
	/* istanbul ignore next — defensive: removeValue вызывается только из multiple-режима */
	if (option && Array.isArray(props.modelValue)) {
		const newValue = props.modelValue.filter(v => v !== option.value)
		emit('update:modelValue', newValue)
		emit('change', newValue)
	}
}
</script>
