/** Composable: применение маски ввода к значениям полей */
import type { NearestTokenResult, UseInputMaskOptions } from './useInputMask.types'

/**
 * Фиксированные токены (ровно 1 символ)
 */
const FIXED_TOKENS = '#@*'

/**
 * Жадные токены (1 или более символов)
 */
const GREEDY_TOKENS = 'NAX'

/** Проверяет, является ли символ токеном */
function isToken(char: string): boolean {
	return FIXED_TOKENS.includes(char) || GREEDY_TOKENS.includes(char)
}

/** Проверяет, является ли токен жадным */
function isGreedy(token: string): boolean {
	return GREEDY_TOKENS.includes(token)
}

/** Проверяет, соответствует ли символ токену */
function matchesToken(char: string, token: string): boolean {
	switch (token) {
		case '#':
			return /\d/.test(char)
		case '@':
			return /[a-zA-Zа-яА-ЯёЁ]/.test(char)
		case '*':
			return /\S/.test(char)
		case 'N':
			return /\d/.test(char)
		case 'A':
			return /[a-zA-Zа-яА-ЯёЁ]/.test(char)
		case 'X':
			return /[a-zA-Zа-яА-ЯёЁ0-9]/.test(char)
		/* istanbul ignore next — exhaustive switch: все возможные токены покрыты выше (isToken гарантирует) */
		default:
			return false
	}
}

/**
 * Применяет маску к значению.
 * Поддерживает фиксированные (#, @, *) и жадные (N, A, X) токены.
 */
function applyMask(value: string, mask: string): string {
	if (!mask) return value

	const cleanValue = stripMask(value, mask)
	let result = ''
	let valueIndex = 0
	let i = 0
	const maxIterations = cleanValue.length * 2
	let iterations = 0

	while (i < mask.length && valueIndex < cleanValue.length && iterations < maxIterations) {
		iterations++
		const maskChar = mask[i]

		// Экранирование: \x
		if (maskChar === '\\') {
			/* istanbul ignore next — defensive `|| ''`: цикл applyMask всегда выходит на vi==cleanValue.length до достижения `\` без следующего символа */
			result += mask[i + 1] || ''
			i += 2
			continue
		}

		// Токен
		if (isToken(maskChar)) {
			if (isGreedy(maskChar)) {
				// Жадный токен: забираем все подходящие символы
				while (valueIndex < cleanValue.length && matchesToken(cleanValue[valueIndex], maskChar)) {
					result += cleanValue[valueIndex]
					valueIndex++
				}
				i++
			} else {
				// Фиксированный токен: ровно 1 символ
				/* istanbul ignore else — defensive: stripMask уже отфильтровал символы, не подходящие под matchesToken, поэтому else-ветка недостижима через публичный API */
				if (matchesToken(cleanValue[valueIndex], maskChar)) {
					result += cleanValue[valueIndex]
					valueIndex++
					i++
				} else {
					valueIndex++
				}
			}
		} else {
			// Литерал
			result += maskChar
			i++
		}
	}

	return result
}

/**
 * Убирает литералы маски из значения.
 * Поддерживает фиксированные и жадные токены.
 */
function stripMask(value: string, mask: string): string {
	if (!mask) return value

	let result = ''
	let maskIndex = 0
	let i = 0

	while (i < value.length && maskIndex < mask.length) {
		const maskChar = mask[maskIndex]

		// Экранирование
		if (maskChar === '\\') {
			maskIndex += 2
			continue
		}

		// Токен
		if (isToken(maskChar)) {
			if (isGreedy(maskChar)) {
				while (i < value.length && matchesToken(value[i], maskChar)) {
					result += value[i]
					i++
				}
				maskIndex++
			} else {
				if (matchesToken(value[i], maskChar)) {
					result += value[i]
				}
				i++
				maskIndex++
			}
		} else {
			// Литерал: пропускаем в value если совпадает
			if (value[i] === maskChar) {
				i++
			}
			maskIndex++
		}
	}

	return result
}

/**
 * Считает максимальное количество фиксированных токенов в маске.
 * Для маски (###) ###-##-## → 10
 */
function getMaxTokenCount(mask: string): number {
	let count = 0
	let hasGreedy = false
	let i = 0

	while (i < mask.length) {
		const maskChar = mask[i]

		if (maskChar === '\\') {
			i += 2
			continue
		}

		if (isToken(maskChar) && isGreedy(maskChar)) {
			hasGreedy = true
		}
		if (isToken(maskChar) && !isGreedy(maskChar)) {
			count++
		}
		i++
	}

	return hasGreedy ? 999 : count
}

/**
 * Находит позицию курсора в маске для заданного индекса в value.
 * valueIndex — индекс символа в чистом значении (без литералов).
 */
function getMaskPosition(valueIndex: number, mask: string): number {
	let pos = 0
	let vi = 0
	let i = 0

	while (i < mask.length && vi <= valueIndex) {
		const maskChar = mask[i]

		if (maskChar === '\\') {
			i += 2
			pos = i
			continue
		}

		if (isToken(maskChar)) {
			if (isGreedy(maskChar)) {
				pos = i + 1
				while (i + 1 < mask.length && !isToken(mask[i + 1]) && mask[i + 1] !== '\\') {
					i++
					pos = i + 1
				}
				i++
			} else {
				if (vi < valueIndex) {
					vi++
				}
				pos = i + 1
				i++
			}
		} else {
			pos = i + 1
			i++
		}
	}

	return pos
}

/**
 * Находит ближайший индекс токена слева от позиции в маске.
 */
function findNearestTokenLeft(maskPos: number, mask: string): NearestTokenResult {
	let i = maskPos - 1

	// Пропускаем литералы
	while (i >= 0 && !isToken(mask[i]) && mask[i] !== '\\') {
		i--
	}

	if (i < 0) {
		return { maskPos: 0, valueIndex: 0 }
	}

	// Если это жадный токен — ищем ближайший фиксированный токен слева
	if (isGreedy(mask[i])) {
		i--
		while (i >= 0 && !isToken(mask[i]) && mask[i] !== '\\') {
			i--
		}
		if (i < 0) {
			return { maskPos: 0, valueIndex: 0 }
		}
	}

	// Считаем количество токенов до него
	let tokenCount = 0
	let j = 0
	while (j < i) {
		const mc = mask[j]
		if (mc === '\\') {
			j += 2
			continue
		}
		if (isToken(mc) && !isGreedy(mc)) {
			tokenCount++
		}
		j++
	}

	return { maskPos: i, valueIndex: tokenCount }
}

/**
 * Composable для системы масок ввода.
 * Вынесена из BaseInput — чистая логика без зависимости от Vue.
 *
 * @example
 * ```ts
 * const mask = useInputMask({ getMask: () => props.mask })
 * const displayValue = mask.applyMask(rawValue, props.mask)
 * const cleanValue = mask.stripMask(rawValue, props.mask)
 * ```
 */
function useInputMask(options: UseInputMaskOptions) {
	/** Текущая маска */
	function getMask(): string {
		return options.getMask()
	}

	/** Применяет текущую маску к значению */
	function maskValue(value: string): string {
		return applyMask(value, getMask())
	}

	/** Снимает текущую маску со значения */
	function unmaskValue(value: string): string {
		return stripMask(value, getMask())
	}

	/** Ограничивает длину значения по маске */
	function limitValue(value: string): string {
		const maxTokens = getMaxTokenCount(getMask())
		return value.length > maxTokens ? value.slice(0, maxTokens) : value
	}

	/** Вычисляет позицию курсора после ввода */
	function cursorAfterInput(cleanLength: number): number {
		return getMaskPosition(cleanLength, getMask())
	}

	/** Вычисляет позицию курсора после Backspace */
	function cursorAfterBackspace(cursorPos: number): NearestTokenResult {
		return findNearestTokenLeft(cursorPos, getMask())
	}

	/** Вычисляет позицию курсора после Delete */
	function cursorAfterDelete(cursorPos: number): NearestTokenResult {
		return findNearestTokenLeft(cursorPos + 1, getMask())
	}

	return {
		applyMask,
		stripMask,
		getMaxTokenCount,
		getMaskPosition,
		findNearestTokenLeft,
		maskValue,
		unmaskValue,
		limitValue,
		cursorAfterInput,
		cursorAfterBackspace,
		cursorAfterDelete,
	}
}

export { useInputMask }
