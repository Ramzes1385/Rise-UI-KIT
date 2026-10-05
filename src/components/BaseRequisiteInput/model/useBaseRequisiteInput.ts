import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { UI_REQUISITES } from '@/locales/messages'
import { computed, ref, shallowRef, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useFormDisabled } from '@composables/form/useFormContext'
import { REQUISITE_INPUT_PARTS } from '../types/BaseRequisiteInput.types'
import { cleanRequisite, REQUISITE_RULES } from './requisites/requisiteRules'
import type { BaseRequisiteInputEmits, BaseRequisiteInputProps, RequisiteStatus } from '../types/BaseRequisiteInput.types'

const LABEL_KEYS = {
	inn: 'INN',
	kpp: 'KPP',
	ogrn: 'OGRN',
	ogrnip: 'OGRNIP',
	bik: 'BIK',
	account: 'ACCOUNT',
	correspondentAccount: 'CORRESPONDENT_ACCOUNT',
	snils: 'SNILS',
} as const

const VALIDITY: Record<RequisiteStatus, boolean | null> = { empty: null, incomplete: null, valid: true, invalid: false }

function statusOf(value: string, props: BaseRequisiteInputProps): RequisiteStatus {
	const rule = REQUISITE_RULES[props.kind]
	if (!value) return 'empty'
	if (!rule.lengths.includes(value.length)) return 'incomplete'
	return rule.check(value, props.bik ?? '') ? 'valid' : 'invalid'
}

function errorText(status: RequisiteStatus, props: BaseRequisiteInputProps): string {
	const isAccount = props.kind === 'account' || props.kind === 'correspondentAccount'
	if (status === 'incomplete')
		return formatMessage(UI_REQUISITES.INCOMPLETE, { count: REQUISITE_RULES[props.kind].lengths.join(` ${UI_REQUISITES.OR} `) })
	if (status !== 'invalid') return ''
	if (isAccount) return UI_REQUISITES.ACCOUNT_MISMATCH
	return props.kind === 'kpp' || props.kind === 'bik' ? UI_REQUISITES.FORMAT : UI_REQUISITES.CHECKSUM
}

function useWrapperUi(props: BaseRequisiteInputProps) {
	const ui = useUi(props, 'base-requisite-input')
	return {
		ui,
		inputUi: computed(() =>
			Object.fromEntries(REQUISITE_INPUT_PARTS.map(part => [part, ui(part).slice(`base-requisite-input__${part}`.length).trim()])),
		),
	}
}

export function useBaseRequisiteInput(props: BaseRequisiteInputProps, emit: BaseRequisiteInputEmits) {
	const value = shallowRef(cleanRequisite(props.modelValue ?? '', props.kind))
	watch(
		() => props.modelValue,
		next => {
			value.value = cleanRequisite(next ?? '', props.kind)
		},
	)
	const isTouched = ref(false)
	const status = computed(() => statusOf(value.value, props))
	const isFull = computed(() => value.value.length === Math.max(...REQUISITE_RULES[props.kind].lengths))
	return {
		...useWrapperUi(props),
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field'] }).classes,
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		value,
		mask: computed(() => REQUISITE_RULES[props.kind].mask),
		fieldLabel: computed(() => props.label ?? UI_REQUISITES[LABEL_KEYS[props.kind]]),
		shownError: computed(() => props.error || (isTouched.value || isFull.value ? errorText(status.value, props) : '')),
		handleInput(text: string): void {
			value.value = cleanRequisite(text, props.kind)
			emit('update:modelValue', value.value)
			emit('validate', VALIDITY[status.value])
		},
		handleFocus(): void {
			isTouched.value = false
		},
		handleBlur(): void {
			isTouched.value = true
		},
	}
}
