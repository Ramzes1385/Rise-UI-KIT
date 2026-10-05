import { useUi } from '@composables/base/useUi'
import { useFormField } from '@composables/form/useFormField'
import { useFieldControl } from '@composables/form/useFormContext'
import { toHTMLElement, toHTMLInputElement } from '@utils/dom/domUtils'
import type { BaseSwitchEmits, SwitchProps } from '../types/BaseSwitch.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onBeforeUpdate, ref, shallowRef, useId, useSlots } from 'vue'

const SWITCH_ELEMENTS = [
	'root',
	'row',
	'wrapper',
	'input',
	'slider',
	'handle',
	'content',
	'caption',
	'label',
	'required',
	'description',
	'errorText',
]

const OWN_CLICK_TARGETS = 'label, input, a, button, select, textarea, summary, [tabindex], [contenteditable]'

function useSlotPresence() {
	const slots = useSlots()
	const read = () => ({ label: Boolean(slots.label), content: Boolean(slots.default) })
	const presence = shallowRef(read())
	onBeforeUpdate(() => {
		const next = read()
		if (next.label !== presence.value.label || next.content !== presence.value.content) presence.value = next
	})
	return presence
}

function useSwitchControl(props: SwitchProps) {
	const slots = useSlotPresence()
	const baseId = useId()
	const errorId = `${baseId}-error`
	const descriptionId = `${baseId}-description`
	const hasLabel = computed(() => Boolean(props.label) || slots.value.label)
	const hasDescription = computed(() => hasLabel.value && slots.value.content)
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const control = useFieldControl({
		id: () => props.inputAttrs?.id as string | undefined,
		hasOwnLabel: hasLabel,
		describedBy: () =>
			[
				formField.error ? errorId : undefined,
				hasDescription.value ? descriptionId : undefined,
				props.inputAttrs?.['aria-describedby'],
			]
				.filter(Boolean)
				.join(' ') || undefined,
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})

	return {
		errorId,
		descriptionId,
		hasLabel,
		hasDescription,
		hasCaption: computed(() => hasLabel.value || slots.value.content),
		formField,
		control,
		inputId: control.id,
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...control.aria.value,
			id: control.id.value,
		})),
	}
}

export function useBaseSwitch(props: SwitchProps, emit: BaseSwitchEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const inputRef = ref<HTMLInputElement | null>(null)
	const field = useSwitchControl(props)

	return {
		...useStandardBaseComponent('base-switch', props, SWITCH_ELEMENTS),
		...field,
		ui: useUi(props, 'base-switch'),
		rootRef,
		inputRef,
		handleChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			emit('update:modelValue', target.checked)
			emit('change', target.checked)
		},
		handleRowClick(event: MouseEvent): void {
			const ownTarget = toHTMLElement(event.target)?.closest(OWN_CLICK_TARGETS)
			if (ownTarget && toHTMLElement(event.currentTarget)?.contains(ownTarget)) return
			inputRef.value?.click()
		},
		exposed: {
			rootRef,
			focus: () => inputRef.value?.focus(),
			blur: () => inputRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
