/** Утилиты: токены маски ввода и проверка символов на соответствие им */

/**
 * Фиксированные токены (ровно 1 символ)
 */
const FIXED_TOKENS = '#@*'

/**
 * Жадные токены (1 или более символов)
 */
const GREEDY_TOKENS = 'NAX'

/** Описание: символ маски — токен (фиксированный или жадный) */
function isToken(char: string): boolean {
	return FIXED_TOKENS.includes(char) || GREEDY_TOKENS.includes(char)
}

/** Описание: токен жадный — забирает все подходящие символы подряд */
function isGreedy(token: string): boolean {
	return GREEDY_TOKENS.includes(token)
}

/** Описание: символ маски — фиксированный токен (ровно один символ значения) */
function isFixedToken(char: string): boolean {
	return isToken(char) && !isGreedy(char)
}

/** Описание: символ маски — литерал (не токен и не экранирование `\`) */
function isPlainLiteral(char: string): boolean {
	return !isToken(char) && char !== '\\'
}

/** Описание: символ значения подходит под токен */
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

export { isFixedToken, isGreedy, isPlainLiteral, isToken, matchesToken }
