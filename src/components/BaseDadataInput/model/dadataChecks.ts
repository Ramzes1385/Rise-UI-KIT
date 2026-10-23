import { formatMessage } from '@/locales/state'
import { isEmailFormat } from '@utils/data/urlUtils'
import { UI_DADATA, UI_REQUISITES, UI_TEXT } from '@/locales/messages'
import type { DadataKind, DadataSuggestion } from '@utils/data/dadataUtils'
import { isValidBik, isValidInn, isValidOgrn } from '@utils/data/requisiteUtils'
import type { BaseDadataInputProps, DadataPrecision } from '../types/BaseDadataInput.types'

const PRECISION_FIELDS: Record<Exclude<DadataPrecision, 'any'>, readonly string[]> = {
	city: ['city', 'settlement'],
	street: ['street', 'house'],
	house: ['house'],
	flat: ['flat'],
}

const PRECISION_KEYS = { city: 'NEED_CITY', street: 'NEED_STREET', house: 'NEED_HOUSE', flat: 'NEED_FLAT' } as const

const DIGIT_RULES: Partial<Record<DadataKind, { lengths: number[]; check: (value: string) => boolean; name: 'INN' | 'OGRN' | 'BIK' }[]>> = {
	party: [
		{ lengths: [10, 12], check: isValidInn, name: 'INN' },
		{ lengths: [13, 15], check: isValidOgrn, name: 'OGRN' },
	],
	bank: [{ lengths: [9], check: isValidBik, name: 'BIK' }],
}

export function precisionOf(props: BaseDadataInputProps): DadataPrecision {
	return (props.kind ?? 'address') === 'address' ? (props.precision ?? 'any') : 'any'
}

export function meetsPrecision(suggestion: DadataSuggestion, precision: DadataPrecision): boolean {
	if (precision === 'any') return true
	return PRECISION_FIELDS[precision].some(field => Boolean(suggestion.data?.[field]))
}

export function digitError(kind: DadataKind, query: string): string {
	const text = query.trim()
	if (!/^\d+$/.test(text)) return ''
	const rule = DIGIT_RULES[kind]?.find(item => item.lengths.includes(text.length))
	if (!rule || rule.check(text)) return ''
	return formatMessage(rule.name === 'BIK' ? UI_DADATA.FORMAT : UI_DADATA.CHECKSUM, { name: UI_REQUISITES[rule.name] })
}

function precisionError(precision: DadataPrecision): string {
	return precision === 'any' ? '' : UI_DADATA[PRECISION_KEYS[precision]]
}

function unconfirmedError(props: BaseDadataInputProps, text: string): string {
	const kind = props.kind ?? 'address'
	const precision = precisionOf(props)
	if (kind === 'email' && !isEmailFormat(text)) return UI_DADATA.EMAIL_FORMAT
	const digits = digitError(kind, text)
	if (digits) return digits
	if (precision !== 'any') return precisionError(precision)
	return props.isStrict ? UI_DADATA.CHOOSE_OPTION : ''
}

export function builtInError(props: BaseDadataInputProps, text: string, suggestion: DadataSuggestion | null): string {
	const value = text.trim()
	if (!value) return props.isRequired ? UI_TEXT.REQUIRED_FIELD : ''
	if (!suggestion) return unconfirmedError(props, value)
	const precision = precisionOf(props)
	return meetsPrecision(suggestion, precision) ? '' : precisionError(precision)
}
