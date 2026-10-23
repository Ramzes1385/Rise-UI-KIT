/** Утилиты: банковская карта — марка по номеру, группировка цифр, проверка Луна, срок действия */
import { CARD_BRANDS } from './cardBrands'
import { toHalfWidth } from '@utils/data/textUtils'
import type { CardBrand, CardBrandOptions, CardBrandPoolEntry as PoolEntry, CardExpiry, CardPrefix } from './types/cardUtils.types'

const MIN_NUMBER_LENGTH = 12
const MAX_NUMBER_LENGTH = 19
const DEFAULT_GAPS = [4, 8, 12, 16]
const MAX_EXPIRY_YEARS = 20

/** Только цифры номера: пробелы, дефисы и прочие знаки отброшены */
export function cardDigits(value: string): string {
	return toHalfWidth(value).replace(/\D/g, '')
}

function prefixLength(digits: string, prefix: CardPrefix): number {
	if (typeof prefix === 'string') return digits.startsWith(prefix) ? prefix.length : 0
	const [from, to] = prefix
	const size = String(from).length
	if (digits.length < size) return 0
	const head = Number(digits.slice(0, size))
	return head >= from && head <= to ? size : 0
}

function longestPrefix(digits: string, prefixes: readonly CardPrefix[]): number {
	return prefixes.reduce((best, prefix) => Math.max(best, prefixLength(digits, prefix)), 0)
}

function brandPool(options: CardBrandOptions): PoolEntry[] {
	const pool = new Map<string, PoolEntry>(CARD_BRANDS.map(brand => [brand.id, { brand, shared: false }]))
	for (const ref of options.brands ?? []) {
		const brand = typeof ref === 'string' ? pool.get(ref)?.brand : ref
		if (brand) pool.set(brand.id, { brand, shared: true })
	}
	return [...pool.values()]
}

function entryScore(digits: string, { brand, shared }: PoolEntry): number {
	const own = longestPrefix(digits, brand.prefixes) * 2
	const common = shared ? longestPrefix(digits, brand.sharedPrefixes) * 2 + 1 : 0
	return Math.max(own, common)
}

/**
 * Марка по номеру (можно неполному и с пробелами): самый длинный совпавший префикс.
 * `undefined` — номер пуст или префикс ещё не набран целиком (`'2'` — Mastercard или Мир)
 */
export function getCardBrand(value: string, options: CardBrandOptions = {}): CardBrand | undefined {
	const digits = cardDigits(value)
	let best: CardBrand | undefined
	let bestScore = 0
	for (const entry of brandPool(options)) {
		const score = entryScore(digits, entry)
		if (score > bestScore) {
			best = entry.brand
			bestScore = score
		}
	}
	return best
}

/** Наибольшая длина номера марки; без марки — 19 */
export function cardNumberMaxLength(brand?: CardBrand): number {
	return brand ? Math.max(...brand.lengths) : MAX_NUMBER_LENGTH
}

/** Номер группами через пробел по марке (`4242 4242 4242 4242`, `3782 822463 10005`); лишние цифры отброшены */
export function formatCardNumber(value: string, brand: CardBrand | undefined = getCardBrand(value)): string {
	const digits = cardDigits(value).slice(0, cardNumberMaxLength(brand))
	const gaps = brand?.gaps ?? DEFAULT_GAPS
	return [...digits].map((digit, index) => (index > 0 && gaps.includes(index) ? ` ${digit}` : digit)).join('')
}

/** Контрольная сумма Луна (ISO/IEC 7812-1) по строке цифр */
export function isLuhnValid(digits: string): boolean {
	if (!/^\d+$/.test(digits)) return false
	const sum = [...digits].reverse().reduce((total, char, index) => {
		const digit = Number(char) * (index % 2 === 1 ? 2 : 1)
		return total + (digit > 9 ? digit - 9 : digit)
	}, 0)
	return sum % 10 === 0
}

/**
 * Номер полный и верный: только цифры, пробелы и дефисы; длина — из допустимых у марки; Луна — если марка её использует.
 * Номер неизвестной марки — 12–19 цифр и Луна
 */
export function isValidCardNumber(value: string, options: CardBrandOptions = {}): boolean {
	if (!/^[\d\s-]+$/.test(value)) return false
	const digits = cardDigits(value)
	const brand = getCardBrand(digits, options)
	if (!brand) return digits.length >= MIN_NUMBER_LENGTH && digits.length <= MAX_NUMBER_LENGTH && isLuhnValid(digits)
	return brand.lengths.includes(digits.length) && (!brand.luhn || isLuhnValid(digits))
}

/** Разобрать срок `ММ/ГГ`, `ММ/ГГГГ` или `ММГГ`; `undefined` — не срок или месяц вне 1–12 */
export function parseCardExpiry(value: string): CardExpiry | undefined {
	const match = /^\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})\s*$/.exec(value) ?? /^\s*(\d{2})(\d{2})\s*$/.exec(value)
	if (!match) return undefined
	const month = Number(match[1])
	const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2])
	return month >= 1 && month <= 12 ? { month, year } : undefined
}

/** Срок действует: карта годна до конца указанного месяца включительно и не дальше чем через 20 лет */
export function isValidExpiry(value: string | CardExpiry, now: Date = new Date()): boolean {
	const expiry = typeof value === 'string' ? parseCardExpiry(value) : value
	if (!expiry || !Number.isInteger(expiry.month) || expiry.month < 1 || expiry.month > 12) return false
	const current = now.getFullYear() * 12 + now.getMonth()
	const until = expiry.year * 12 + expiry.month - 1
	return until >= current && expiry.year <= now.getFullYear() + MAX_EXPIRY_YEARS
}
