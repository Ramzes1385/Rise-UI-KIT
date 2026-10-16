import { getLocale } from '@/locales/state'
import { toHalfWidth } from '@utils/data/textUtils'
import type { ParsedPhone, PhoneCountry } from '../../types/BasePhoneInput.types'

export const onlyDigits = (text: string): string => toHalfWidth(text).replace(/\D/g, '')

export const maskSize = (mask: string): number => mask.split('#').length - 1

export const maskPlaceholder = (mask: string): string => mask.replace(/#/g, '0')

export function regionName(code: string): string {
	return new Intl.DisplayNames([getLocale().intl], { type: 'region' }).of(code) ?? code
}

export function parsePhone(value: string, countries: readonly PhoneCountry[], preferred?: string): ParsedPhone {
	const digits = onlyDigits(value)
	if (!digits) return { country: undefined, digits: '' }
	const candidates = countries.filter(country => digits.startsWith(country.dialCode))
	const longest = [...candidates].sort((a, b) => b.dialCode.length - a.dialCode.length)[0]
	const country = candidates.find(item => item.code === preferred) ?? longest
	return country ? { country, digits: digits.slice(country.dialCode.length) } : { country: undefined, digits }
}

export function pastedPhone(text: string, context: { countries: readonly PhoneCountry[]; current: PhoneCountry }): ParsedPhone | null {
	const digits = onlyDigits(text)
	const { current } = context
	const size = maskSize(current.mask)
	if (text.trim().startsWith('+')) {
		const parsed = parsePhone(digits, context.countries, current.code)
		return parsed.country ? { country: parsed.country, digits: parsed.digits.slice(0, maskSize(parsed.country.mask)) } : null
	}
	if (digits.length === size + current.dialCode.length && digits.startsWith(current.dialCode))
		return { country: current, digits: digits.slice(current.dialCode.length) }
	if (current.dialCode === '7' && digits.length === size + 1 && digits.startsWith('8'))
		return { country: current, digits: digits.slice(1) }
	return null
}
