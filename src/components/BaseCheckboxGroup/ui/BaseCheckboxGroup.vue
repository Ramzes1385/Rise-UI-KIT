<template>
	<!-- Группа флажков: имя — заголовок (или подпись BaseFormField вокруг), ошибка и описание описывают группу -->
	<div
		class="base-checkbox-group"
		:class="[variantClass, classes.root, { 'base-checkbox-group--error': control.hasError.value }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-labelledby="labelledBy"
		:aria-describedby="control.aria.value['aria-describedby']">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:is-required="isRequired"
			class-name="base-checkbox-group__label"
			:custom-class="classes.label"
			required-class-name="base-checkbox-group__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div class="base-checkbox-group__options" :class="[{ 'base-checkbox-group__options--vertical': isVertical }, classes.options]">
			<BaseCheckbox
				v-if="hasSelectAll"
				class="base-checkbox-group__select-all"
				:variant="variant"
				:label="selectAllLabel ?? UI_TEXT.SELECT_ALL_OPTIONS"
				:model-value="isAllChecked"
				:is-indeterminate="isPartlyChecked"
				:is-disabled="isControlDisabled || enabledValues.length === 0"
				:size-scale="sizeScale"
				:custom-class="{ root: classes.checkbox }"
				@update:model-value="handleSelectAll" />
			<BaseCheckbox
				v-for="option in options"
				:key="option.value"
				class="base-checkbox-group__checkbox"
				:variant="variant"
				:label="option.label"
				:model-value="checkedSet.has(option.value)"
				:is-disabled="isControlDisabled || option.isDisabled"
				:size-scale="sizeScale"
				:custom-class="{ root: classes.checkbox }"
				@update:model-value="handleToggle(option.value, $event)" />
		</div>

		<FormFieldError
			:id="errorId"
			:error="error ?? ''"
			class-name="base-checkbox-group__error"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseCheckboxGroup.style.scss'
import type { BaseCheckboxGroupEmits, BaseCheckboxGroupProps } from '../model/BaseCheckboxGroup.types'

const props = withDefaults(
	defineProps<BaseCheckboxGroupProps>(),
	kitDefaults('BaseCheckboxGroup', {
		variant: DEFAULT_VARIANT,
		modelValue: () => [],
		isRequired: false,
		isDisabled: false,
		isVertical: false,
		hasSelectAll: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCheckboxGroupEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-checkbox-group', props, [
	'root',
	'label',
	'required',
	'options',
	'checkbox',
	'error',
])

const ownId = useId()
const labelId = `${ownId}-label`
const errorId = `${ownId}-error`

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

/** Группа в BaseFormField: подпись обёртки называет группу, её описание или ошибка описывают группу */
const control = useFieldControl({
	isLabelable: false,
	describedBy: () => (props.error ? errorId : undefined),
	hasError: () => Boolean(props.error),
})

const labelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))

const checkedSet = computed(() => new Set(props.modelValue))

/** Значения доступных вариантов: их отмечает и снимает «Выбрать все» */
const enabledValues = computed(() => props.options.filter(option => !option.isDisabled).map(option => option.value))

const isAllChecked = computed(() => enabledValues.value.length > 0 && enabledValues.value.every(value => checkedSet.value.has(value)))
const isPartlyChecked = computed(() => !isAllChecked.value && enabledValues.value.some(value => checkedSet.value.has(value)))

/** Новый набор в порядке вариантов; отмеченные значения вне вариантов сохраняются в конце */
function update(next: Set<string | number>): void {
	const known = new Set(props.options.map(option => option.value))
	const value = [
		...props.options.map(option => option.value).filter(item => next.has(item)),
		...props.modelValue.filter(item => !known.has(item)),
	]
	emit('update:modelValue', value)
	emit('change', value)
}

function handleToggle(value: string | number, isChecked: boolean): void {
	const next = new Set(checkedSet.value)
	if (isChecked) next.add(value)
	else next.delete(value)
	update(next)
}

/** «Выбрать все»: отмечает доступные варианты, а если все уже отмечены — снимает их; недоступные не трогает */
function handleSelectAll(): void {
	const next = new Set(checkedSet.value)
	for (const value of enabledValues.value) {
		if (isAllChecked.value) next.delete(value)
		else next.add(value)
	}
	update(next)
}
</script>
