/** Composable: логика BaseCheckboxGroup — отмеченные значения, «Выбрать все» и связь с BaseFormField */
import { computed, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'
import type { BaseCheckboxGroupEmits, CheckboxGroupProps } from '../types/BaseCheckboxGroup.types'

const GROUP_ELEMENTS = ['root', 'label', 'required', 'options', 'checkbox', 'error']

function useGroupField(props: CheckboxGroupProps) {
	const ownId = useId()
	const labelId = `${ownId}-label`
	const errorId = `${ownId}-error`
	// Группа в BaseFormField: подпись обёртки называет группу, её описание или ошибка описывают группу
	const control = useFieldControl({
		isLabelable: false,
		describedBy: () => (props.error ? errorId : undefined),
		hasError: () => Boolean(props.error),
	})

	return {
		labelId,
		errorId,
		/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		control,
		labelledBy: computed(() => (props.label ? labelId : control.fieldLabelId.value)),
	}
}

function useCheckedValues(props: CheckboxGroupProps, emit: BaseCheckboxGroupEmits) {
	const checkedSet = computed(() => new Set(props.modelValue))
	/** Значения доступных вариантов: их отмечает и снимает «Выбрать все» */
	const enabledValues = computed(() => props.options.filter(option => !option.isDisabled).map(option => option.value))
	const isAllChecked = computed(() => enabledValues.value.length > 0 && enabledValues.value.every(value => checkedSet.value.has(value)))

	/** Новый набор в порядке вариантов; отмеченные значения вне вариантов сохраняются в конце */
	const update = (next: Set<string | number>): void => {
		const known = new Set(props.options.map(option => option.value))
		const value = [
			...props.options.map(option => option.value).filter(item => next.has(item)),
			...props.modelValue.filter(item => !known.has(item)),
		]
		emit('update:modelValue', value)
		emit('change', value)
	}

	return {
		checkedSet,
		enabledValues,
		isAllChecked,
		isPartlyChecked: computed(() => !isAllChecked.value && enabledValues.value.some(value => checkedSet.value.has(value))),
		handleToggle(value: string | number, isChecked: boolean): void {
			const next = new Set(checkedSet.value)
			if (isChecked) next.add(value)
			else next.delete(value)
			update(next)
		},
		/** «Выбрать все»: отмечает доступные варианты, а если все уже отмечены — снимает их; недоступные не трогает */
		handleSelectAll(): void {
			const next = new Set(checkedSet.value)
			for (const value of enabledValues.value) {
				if (isAllChecked.value) next.delete(value)
				else next.add(value)
			}
			update(next)
		},
	}
}

export function useBaseCheckboxGroup(props: CheckboxGroupProps, emit: BaseCheckboxGroupEmits) {
	return {
		...useStandardBaseComponent('base-checkbox-group', props, GROUP_ELEMENTS),
		...useGroupField(props),
		...useCheckedValues(props, emit),
	}
}
