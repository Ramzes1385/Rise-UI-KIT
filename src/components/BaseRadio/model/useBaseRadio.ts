import { computed, ref, useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { UiClassFn } from '@composables/base/useUi'
import { RADIO_ITEM_PARTS } from '../types/BaseRadio.types'
import { useFormField } from '@composables/form/useFormField'
import { useFieldControl } from '@composables/form/useFormContext'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRadioEmits, BaseRadioItemPart, BaseRadioPart, RadioProps } from '../types/BaseRadio.types'

const RADIO_ELEMENTS = ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText']

const ITEM_PARTS = new Set<string>(RADIO_ITEM_PARTS)

function itemClass(part: BaseRadioItemPart): string {
	return part === 'item' ? 'base-radio-item' : `base-radio-item__${part}`
}

function useRadioUi(props: RadioProps): UiClassFn<BaseRadioPart> {
	const ui = useUi(props, 'base-radio')
	return part => {
		if (!ITEM_PARTS.has(part)) return ui(part)
		const [, ...extra] = ui(part).split(' ')
		return [itemClass(part as BaseRadioItemPart), ...extra].join(' ')
	}
}

function useRadioGroupField(props: RadioProps) {
	const groupId = useId()
	const labelId = `${groupId}-label`
	const errorId = `${groupId}-error`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const control = useFieldControl({
		isLabelable: false,
		hasOwnLabel: () => Boolean(props.label),
		describedBy: () => (formField.error ? errorId : undefined),
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})
	const labelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))

	return {
		labelId,
		errorId,
		formField,
		control,
		groupAttrs: computed(() => ({
			'aria-labelledby': labelledBy.value,
			'aria-label': labelledBy.value ? undefined : props.ariaLabel,
			...control.aria.value,
		})),
	}
}

export function useBaseRadio(props: RadioProps, emit: BaseRadioEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const field = useRadioGroupField(props)

	return {
		...useStandardBaseComponent('base-radio', props, RADIO_ELEMENTS),
		...field,
		ui: useRadioUi(props),
		rootRef,
		handleChange(value: string | number): void {
			emit('update:modelValue', value)
			emit('change', value)
		},
		exposed: {
			rootRef,
			focus: () => rootRef.value?.querySelector('input')?.focus(),
			blur: () => rootRef.value?.querySelector('input')?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
