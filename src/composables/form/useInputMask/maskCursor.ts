import { isFixedToken, isGreedy, isPlainLiteral, isToken } from './maskTokens'
/** Утилиты: вместимость маски и позиция курсора в маскированном значении */
import type { MaskPositionState, NearestTokenResult } from './types/useInputMask.types'

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

/** Описание: курсор — сразу за текущим символом маски, переход к следующему */
function advancePast(state: MaskPositionState): void {
	state.pos = state.maskIndex + 1
	state.maskIndex++
}

/** Описание: жадный токен — курсор встаёт за литералами, которые идут сразу после него */
function skipGreedyLiterals(state: MaskPositionState, mask: string): void {
	state.pos = state.maskIndex + 1
	while (state.maskIndex + 1 < mask.length && isPlainLiteral(mask[state.maskIndex + 1])) {
		state.maskIndex++
		state.pos = state.maskIndex + 1
	}
	state.maskIndex++
}

/** Описание: один шаг поиска позиции курсора — экранированный символ, литерал, жадный или фиксированный токен */
function positionStep(state: MaskPositionState, mask: string, valueIndex: number): void {
	const maskChar = mask[state.maskIndex]

	if (maskChar === '\\') {
		state.maskIndex += 2
		state.pos = state.maskIndex
		return
	}

	if (!isToken(maskChar)) {
		advancePast(state)
		return
	}

	if (isGreedy(maskChar)) {
		skipGreedyLiterals(state, mask)
		return
	}

	if (state.valueIndex < valueIndex) state.valueIndex++
	advancePast(state)
}

/**
 * Находит позицию курсора в маске для заданного индекса в value.
 * valueIndex — индекс символа в чистом значении (без литералов).
 */
function getMaskPosition(valueIndex: number, mask: string): number {
	const state: MaskPositionState = { pos: 0, maskIndex: 0, valueIndex: 0 }

	while (state.maskIndex < mask.length && state.valueIndex <= valueIndex) {
		positionStep(state, mask, valueIndex)
	}

	return state.pos
}

/** Описание: первая позиция слева от from (включительно), где стоит токен или `\`; -1 — таких нет */
function skipLiteralsLeft(mask: string, from: number): number {
	let i = from
	while (i >= 0 && isPlainLiteral(mask[i])) {
		i--
	}
	return i
}

/** Описание: сколько фиксированных токенов стоит в маске до позиции end */
function countFixedTokensBefore(mask: string, end: number): number {
	let tokenCount = 0
	let j = 0
	while (j < end) {
		const mc = mask[j]
		if (mc === '\\') {
			j += 2
			continue
		}
		if (isFixedToken(mc)) {
			tokenCount++
		}
		j++
	}
	return tokenCount
}

/** Описание: ближайший токен слева от позиции в маске; жадный токен пропускается вместе с литералами перед ним */
function findNearestTokenLeft(maskPos: number, mask: string): NearestTokenResult {
	let i = skipLiteralsLeft(mask, maskPos - 1)

	if (i >= 0 && isGreedy(mask[i])) {
		i = skipLiteralsLeft(mask, i - 1)
	}

	if (i < 0) {
		return { maskPos: 0, valueIndex: 0 }
	}

	return { maskPos: i, valueIndex: countFixedTokensBefore(mask, i) }
}

export { findNearestTokenLeft, getMaskPosition, getMaxTokenCount }
