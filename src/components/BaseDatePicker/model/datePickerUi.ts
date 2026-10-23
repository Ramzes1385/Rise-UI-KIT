import type { UiClassFn } from '@composables/base/useUi'
import { DATE_PICKER_INPUT_PARTS } from '../types/BaseDatePicker.types'
import type { BaseDatePickerPart } from '../types/BaseDatePicker.types'

export function partClassOf(props: { readonly partClass?: UiClassFn<BaseDatePickerPart> }): UiClassFn<BaseDatePickerPart> {
	return part => props.partClass?.(part) ?? ''
}

function withoutBlockClass(classes: string, part: BaseDatePickerPart): string {
	const bem = `base-date-picker__${part}`
	return (classes.startsWith(bem) ? classes.slice(bem.length) : classes).trim()
}

export function inputUiOf(ui: UiClassFn<BaseDatePickerPart>): Record<string, string> {
	return Object.fromEntries(Object.entries(DATE_PICKER_INPUT_PARTS).map(([inner, part]) => [inner, withoutBlockClass(ui(part), part)]))
}
