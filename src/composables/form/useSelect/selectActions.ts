/** Утилиты: открытие, закрытие, выбор и снятие значений useSelect */
import { resolveOptionValue, toggleValue } from './selectOptions'
import type { SelectContext, SelectValue } from './types/useSelect.types'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'

function emitValue(ctx: SelectContext, value: SelectValue | SelectValue[]): void {
	ctx.emit('update:modelValue', value)
	ctx.emit('change', value)
}

/** Описание: выбор опции — в множественном режиме переключает значение, в одиночном выбирает и закрывает список */
function selectOption(ctx: SelectContext, option: BaseSelectOption): void {
	if (option.isDisabled) return

	if (ctx.props.isMultiple) {
		/* istanbul ignore next — defensive: при isMultiple modelValue гарантированно массив */
		const values = Array.isArray(ctx.props.modelValue) ? ctx.props.modelValue : []
		emitValue(ctx, toggleValue(values, option.value))
		return
	}
	emitValue(ctx, option.value)
	ctx.isOpen.value = false
	ctx.searchQuery.value = ''
}

/** Описание: действия списка — открыть, переключить, закрыть, выбрать, снять значение тега */
function createSelectActions(ctx: SelectContext) {
	const { props, isOpen, searchQuery } = ctx

	return {
		openDropdown(): void {
			if (!ctx.isDisabled()) isOpen.value = true
		},
		toggleDropdown(): void {
			if (ctx.isDisabled()) return
			isOpen.value = !isOpen.value
			if (!isOpen.value) {
				searchQuery.value = ''
			}
		},
		handleClose(): void {
			searchQuery.value = ''
			ctx.onBlur()
		},
		handleSelect: (option: BaseSelectOption): void => selectOption(ctx, option),
		removeValue(value: SelectValue): void {
			if (!Array.isArray(props.modelValue)) return
			const targetValue = resolveOptionValue(props.options, value)
			emitValue(
				ctx,
				props.modelValue.filter(v => v !== targetValue),
			)
		},
	}
}

export { createSelectActions }
