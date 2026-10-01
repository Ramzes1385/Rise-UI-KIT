import { isGreedy, isToken, matchesToken } from './maskTokens'
/** Утилиты: наложение и снятие маски ввода */
import type { MaskScanState } from './types/useInputMask.types'

function createScanState(): MaskScanState {
	return { result: '', maskIndex: 0, valueIndex: 0 }
}

/** Описание: жадный токен — забирает из source все подходящие символы подряд */
function takeGreedy(state: MaskScanState, source: string, token: string): void {
	while (state.valueIndex < source.length && matchesToken(source[state.valueIndex], token)) {
		state.result += source[state.valueIndex]
		state.valueIndex++
	}
	state.maskIndex++
}

function appendLiteral(state: MaskScanState, literal: string, maskStep: number): void {
	state.result += literal
	state.maskIndex += maskStep
}

function applyFixedToken(state: MaskScanState, cleanValue: string, token: string): void {
	/* istanbul ignore else — defensive: stripMask уже отфильтровал символы, не подходящие под matchesToken, поэтому else-ветка недостижима через публичный API */
	if (matchesToken(cleanValue[state.valueIndex], token)) {
		state.result += cleanValue[state.valueIndex]
		state.valueIndex++
		state.maskIndex++
	} else {
		state.valueIndex++
	}
}

/** Описание: один шаг наложения маски — экранированный символ, литерал, жадный или фиксированный токен */
function applyStep(state: MaskScanState, mask: string, cleanValue: string): void {
	const maskChar = mask[state.maskIndex]

	if (maskChar === '\\') {
		/* istanbul ignore next — defensive `|| ''`: цикл applyMask всегда выходит на vi==cleanValue.length до достижения `\` без следующего символа */
		appendLiteral(state, mask[state.maskIndex + 1] || '', 2)
		return
	}

	if (!isToken(maskChar)) {
		appendLiteral(state, maskChar, 1)
		return
	}

	if (isGreedy(maskChar)) {
		takeGreedy(state, cleanValue, maskChar)
		return
	}

	applyFixedToken(state, cleanValue, maskChar)
}

/**
 * Применяет маску к значению.
 * Поддерживает фиксированные (#, @, *) и жадные (N, A, X) токены.
 */
function applyMask(value: string, mask: string): string {
	if (!mask) return value

	const cleanValue = stripMask(value, mask)
	const state = createScanState()
	// Каждая итерация сдвигает позицию в маске или в значении, поэтому mask.length + cleanValue.length —
	// точная верхняя граница. Лимит от длины значения (cleanValue.length * 2) обрывал вывод на масках
	// с несколькими литералами подряд: '+7 (###)…' при вводе первой цифры показывала только '+7'.
	const maxIterations = mask.length + cleanValue.length

	for (
		let iterations = 0;
		state.maskIndex < mask.length && state.valueIndex < cleanValue.length && iterations < maxIterations;
		iterations++
	) {
		applyStep(state, mask, cleanValue)
	}

	return state.result
}

/** Описание: литерал маски при снятии — пропускает его в value, если символ совпадает */
function skipLiteral(state: MaskScanState, value: string, literal: string): void {
	if (value[state.valueIndex] === literal) state.valueIndex++
	state.maskIndex++
}

function stripFixedToken(state: MaskScanState, value: string, token: string): void {
	if (matchesToken(value[state.valueIndex], token)) state.result += value[state.valueIndex]
	state.valueIndex++
	state.maskIndex++
}

/** Описание: один шаг снятия маски — экранированный символ, литерал, жадный или фиксированный токен */
function stripStep(state: MaskScanState, mask: string, value: string): void {
	const maskChar = mask[state.maskIndex]

	if (maskChar === '\\') {
		state.maskIndex += 2
		return
	}

	if (!isToken(maskChar)) {
		skipLiteral(state, value, maskChar)
		return
	}

	if (isGreedy(maskChar)) {
		takeGreedy(state, value, maskChar)
		return
	}

	stripFixedToken(state, value, maskChar)
}

/** Описание: снимает маску — оставляет только символы, попавшие в токены */
function stripMask(value: string, mask: string): string {
	if (!mask) return value

	const state = createScanState()
	while (state.valueIndex < value.length && state.maskIndex < mask.length) {
		stripStep(state, mask, value)
	}

	return state.result
}

export { applyMask, stripMask }
