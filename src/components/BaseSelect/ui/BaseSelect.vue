<template>
	<BaseDropdown
		v-model:is-open="isOpen"
		class="base-select__dropdown"
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
					'base-select--disabled': isControlDisabled,
					'base-select--error': control.hasError.value,
					'base-select--multiple': isMultiple,
					'base-select--has-tags': hasTags,
				},
				classes.root,
			]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<!-- Подпись — имя триггера (aria-labelledby); клик по ней ставит фокус на триггер, как у нативного select -->
			<FormFieldLabel
				v-if="label"
				:id="labelId"
				tag="span"
				:label="label"
				:is-required="isRequired"
				class-name="base-select__label"
				:custom-class="classes.label"
				required-class-name="base-select__required"
				:required-custom-class="classes.required"
				:size-scale="sizeScale"
				@click="focusTrigger" />

			<!-- Триггер — combobox по шаблону APG «select-only»: фокус остаётся на нём, активная опция — aria-activedescendant -->
			<div
				ref="selectRef"
				class="base-select__trigger"
				:class="classes.trigger"
				role="combobox"
				:tabindex="isControlDisabled ? undefined : 0"
				aria-haspopup="listbox"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="isOpen ? listboxId : undefined"
				:aria-activedescendant="isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
				:aria-labelledby="triggerLabelledBy"
				:aria-label="triggerLabelledBy ? undefined : resolvedPlaceholder"
				v-bind="control.aria.value"
				:aria-disabled="isControlDisabled ? 'true' : undefined"
				@click="toggleDropdown"
				@keydown="handleTriggerKeydown">
				<slot name="trigger" :is-open="isOpen" :selected-label="selectedLabel" :selected-labels="selectedLabels">
					<div class="base-select__values" :class="classes.values">
						<template v-if="hasTags">
							<slot v-if="$slots.tag" name="tag" :labels="selectedLabels" :items="selectedItems" :remove="removeValue" />
							<template v-else>
								<BaseBadge
									v-for="item in selectedItems"
									:key="item.value"
									variant="soft"
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
									<!-- Мышью убирает значение; с клавиатуры то же делает повторный выбор опции в списке -->
									<button
										v-if="!isControlDisabled"
										type="button"
										class="base-select__tag-close"
										:class="classes.tagClose"
										tabindex="-1"
										:aria-label="`${UI_TEXT.DELETE} ${item.label}`"
										@click.stop="removeValue(item.value)">
										<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
									</button>
								</BaseBadge>
							</template>
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
						<BaseText
							v-else
							tag="span"
							class="base-select__placeholder"
							:custom-class="classes.placeholder"
							:size-scale="sizeScale"
							>{{ resolvedPlaceholder }}</BaseText
						>
					</div>
				</slot>
				<BaseIcon
					class="base-select__arrow"
					:custom-class="classes.arrow"
					name="chevron-down"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</div>

			<FormFieldError
				:id="errorId"
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
				:listbox-id="listboxId"
				:labelledby="label ? labelId : undefined"
				:listbox-label="resolvedPlaceholder"
				:active-index="activeIndex"
				:get-option-id="getOptionId"
				@select="handleSelect"
				@activate="setActive"
				@search-keydown="handleSearchKeydown">
				<template v-if="$slots.header" #header>
					<slot name="header" />
				</template>
				<template #option="slotProps">
					<slot name="option" v-bind="slotProps" />
				</template>
				<template #empty>
					<slot name="empty" />
				</template>
				<template v-if="$slots.footer" #footer>
					<slot name="footer" />
				</template>
			</BaseSelectDropdown>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseBadge } from '@components/BaseBadge'
import { BaseDropdown } from '@components/BaseDropdown'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'
import { useFormField } from '@composables/useFormField'
import { useSelect } from '@composables/useSelect'
import '../styles/BaseSelect.style.scss'
import { calcIconScale } from '@utils/iconUtils'
import BaseSelectDropdown from './BaseSelectDropdown.vue'
import type { BaseSelectEmits, BaseSelectProps, BaseSelectSlots } from '../model/BaseSelect.types'

const props = withDefaults(defineProps<BaseSelectProps>(), kitDefaults('BaseSelect', {
	modelValue: '',
	label: '',
	isRequired: false,
	isMultiple: false,
	isSearchable: false,
	isDisabled: false,
	error: '',
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

/** Подсказка пустого поля: своя или «Выберите...» на текущем языке */
const resolvedPlaceholder = computed(() => props.placeholder ?? UI_TEXT.SELECT_PLACEHOLDER)

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

/** id подписи, ошибки и списка: подпись — имя триггера, ошибка — его описание, список — его popup (aria-controls) */
const baseId = useId()
const labelId = `${baseId}-label`
const errorId = `${baseId}-error`
const listboxId = `${baseId}-listbox`

/** id опции по индексу в отфильтрованном списке — для aria-activedescendant */
function getOptionId(index: number): string {
	return `${listboxId}-option-${index}`
}

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы не блокирует combobox на div) */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

/**
 * Триггер и BaseFormField вокруг: подпись обёртки называет триггер через aria-labelledby (`for` к div не применим),
 * её описание или ошибка — в aria-describedby, aria-invalid и aria-required
 */
const control = useFieldControl({
	isLabelable: false,
	describedBy: () => (formField.error ? errorId : undefined),
	hasError: () => Boolean(formField.error),
	isRequired: () => props.isRequired,
})

/** Имя триггера: своя подпись, иначе подпись BaseFormField */
const triggerLabelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))

const selectRef = ref<HTMLDivElement | null>(null)

const {
	isOpen,
	searchQuery,
	activeIndex,
	selectedOption,
	selectedLabel,
	selectedItems,
	selectedLabels,
	filteredOptions,
	openDropdown,
	toggleDropdown,
	handleClose,
	isSelected,
	handleSelect,
	selectActive,
	moveActive,
	setActiveEdge,
	setActive,
	typeaheadActive,
	isTypingAhead,
	removeValue,
} = useSelect({
	props,
	emit,
	onBlur: formField.onBlur,
	isDisabled: () => isControlDisabled.value,
})

/** В мультивыборе есть выбранные значения — они показаны бейджами */
const hasTags = computed(() => props.isMultiple && Array.isArray(props.modelValue) && props.modelValue.length > 0)

function focusTrigger(): void {
	if (!isControlDisabled.value) selectRef.value?.focus()
}

/** Печатный символ без модификаторов — для поиска по буквам */
function isPrintableKey(event: KeyboardEvent): boolean {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}

/**
 * Клавиатура на триггере по APG «select-only combobox»: Enter/Space открывают список или выбирают активную опцию,
 * стрелки открывают список и двигают активную опцию, Home/End открывают список на первой/последней опции,
 * буквы открывают список и ищут опцию по началу подписи (без поля поиска), Tab закрывает список.
 * Escape закрывает BaseDropdown.
 */
function handleTriggerKeydown(event: KeyboardEvent): void {
	if (isControlDisabled.value) return
	// Пробел посреди набираемого слова — часть поиска, а не выбор
	if (event.key === ' ' && isTypingAhead()) {
		event.preventDefault()
		typeaheadActive(' ')
		return
	}
	switch (event.key) {
		case 'Enter':
		case ' ':
			event.preventDefault()
			if (isOpen.value && activeIndex.value >= 0) selectActive()
			else toggleDropdown()
			break
		case 'ArrowDown':
		case 'ArrowUp':
			event.preventDefault()
			if (isOpen.value) moveActive(event.key === 'ArrowDown' ? 1 : -1)
			else openDropdown()
			break
		case 'Home':
		case 'End':
			event.preventDefault()
			openDropdown()
			setActiveEdge(event.key === 'Home' ? 'first' : 'last')
			break
		case 'Tab':
			if (isOpen.value) closeDropdown()
			break
		default:
			if (props.isSearchable || !isPrintableKey(event)) return
			event.preventDefault()
			openDropdown()
			typeaheadActive(event.key)
	}
}

/**
 * Клавиши в поле поиска панели: стрелки двигают активную опцию, Enter выбирает её, Tab закрывает список
 * (фокус возвращается на триггер); остальное — ввод текста.
 */
function handleSearchKeydown(event: KeyboardEvent): void {
	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault()
		moveActive(event.key === 'ArrowDown' ? 1 : -1)
	} else if (event.key === 'Enter') {
		event.preventDefault()
		selectActive()
	} else if (event.key === 'Tab') {
		event.preventDefault()
		closeDropdown()
	}
}

/** Закрытие с клавиатуры: как закрытие кликом снаружи — сброс поиска и проверка обязательности */
function closeDropdown(): void {
	isOpen.value = false
	handleClose()
}

defineExpose({
	rootRef: selectRef,
	selectRef,
	focus: () => selectRef.value?.focus(),
	blur: () => selectRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
