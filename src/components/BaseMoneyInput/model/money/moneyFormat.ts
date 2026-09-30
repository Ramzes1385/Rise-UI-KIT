import type { UiKitLocale } from '@/locales/types/locales.types'
import type { MoneyFormat } from '../../types/BaseMoneyInput.types'

const partOf = (parts: Intl.NumberFormatPart[], type: Intl.NumberFormatPartTypes): string =>
	parts.find(part => part.type === type)?.value ?? ''

export function moneyFormat(locale: UiKitLocale, options: { currency: string; min: number }): MoneyFormat {
	const currency = new Intl.NumberFormat(locale.intl, { style: 'currency', currency: options.currency })
	const parts = currency.formatToParts(-12345.6)
	const types = parts.map(part => part.type)
	return {
		locale: locale.intl,
		group: partOf(parts, 'group'),
		decimal: partOf(parts, 'decimal'),
		symbol: partOf(parts, 'currency'),
		isSymbolFirst: types.indexOf('currency') < types.indexOf('integer'),
		fraction: currency.resolvedOptions().maximumFractionDigits ?? 2,
		isNegativeAllowed: options.min < 0,
	}
}

export function cleanMoney(text: string, format: MoneyFormat): string {
	const isNegative = format.isNegativeAllowed && /^\s*[-−]/.test(text)
	const ungrouped = /[.,]/.test(format.group) ? text.split(format.group).join('') : text
	const kept = ungrouped.replace(/[^\d.,]/g, '')
	const separator = kept.search(/[.,]/)
	const integer = (separator < 0 ? kept : kept.slice(0, separator)).replace(/^0+(?=\d)/, '')
	const fraction =
		separator < 0
			? ''
			: kept
					.slice(separator + 1)
					.replace(/[.,]/g, '')
					.slice(0, format.fraction)
	const tail = separator < 0 || format.fraction === 0 ? '' : `.${fraction}`
	return `${isNegative ? '-' : ''}${integer}${tail}`
}

export function draftText(clean: string, format: MoneyFormat): string {
	const [integer, fraction] = clean.replace('-', '').split('.')
	const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.group)
	const tail = fraction === undefined ? '' : `${format.decimal}${fraction}`
	return `${clean.startsWith('-') ? '-' : ''}${grouped}${tail}`
}

export function parseMoney(clean: string): number | null {
	const value = Number.parseFloat(clean)
	return Number.isNaN(value) ? null : value
}

export function formatMoney(value: number | null, format: MoneyFormat): string {
	if (value === null) return ''
	const fraction = Number.isInteger(value) ? 0 : format.fraction
	return new Intl.NumberFormat(format.locale, { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

const isMeaningful = (char: string, format: MoneyFormat): boolean => char !== format.group && /[\d.,-]/.test(char)

export const countMeaningful = (text: string, format: MoneyFormat): number => [...text].filter(char => isMeaningful(char, format)).length

export function caretAfter(text: string, count: number, format: MoneyFormat): number {
	let seen = 0
	for (let index = 0; index < text.length; index += 1) {
		if (seen === count) return index
		if (isMeaningful(text[index], format)) seen += 1
	}
	return text.length
}
