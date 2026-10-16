/** Утилиты поля числа (BaseInputNumber): разбор ввода, округление, границы */
import { toHalfWidth } from '@utils/data/textUtils'

/**
 * Разобрать набранный текст: `1,5` и `1.5` — 1.5, пробелы и знак U+2212 допускаются.
 * `null` — пустое поле, `undefined` — ввод ещё не число (`-`, `1,2,`, буквы)
 */
function parseNumberInput(text: string): number | null | undefined {
	const normalized = toHalfWidth(text).replace(/\s/g, '').replace(/−/g, '-').replace(',', '.')
	if (normalized === '') return null
	if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return undefined
	return Number(normalized)
}

/** Знаков после запятой у шага: 0.25 → 2, 1 → 0 */
function stepPrecision(step: number): number {
	const [, decimals = ''] = String(step).split('.')
	return decimals.length
}

/** Округлить до знаков после запятой без хвостов плавающей точки (0.1 + 0.2 → 0.3) */
function roundToPrecision(value: number, precision: number): number {
	return Number(value.toFixed(precision))
}

function clampNumber(value: number, min?: number, max?: number): number {
	if (max !== undefined && value > max) return max
	if (min !== undefined && value < min) return min
	return value
}

export { clampNumber, parseNumberInput, roundToPrecision, stepPrecision }
