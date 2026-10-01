/** Composable: применение маски ввода к значениям полей */
import { applyMask, stripMask } from './maskFormat'
import { findNearestTokenLeft, getMaskPosition, getMaxTokenCount } from './maskCursor'
import type { NearestTokenResult, UseInputMaskOptions, UseInputMaskReturn } from './types/useInputMask.types'

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
function useInputMask(options: UseInputMaskOptions): UseInputMaskReturn {
	function getMask(): string {
		return options.getMask()
	}

	function maskValue(value: string): string {
		return applyMask(value, getMask())
	}

	function unmaskValue(value: string): string {
		return stripMask(value, getMask())
	}

	function limitValue(value: string): string {
		const maxTokens = getMaxTokenCount(getMask())
		return value.length > maxTokens ? value.slice(0, maxTokens) : value
	}

	function cursorAfterInput(cleanLength: number): number {
		return getMaskPosition(cleanLength, getMask())
	}

	function cursorAfterBackspace(cursorPos: number): NearestTokenResult {
		return findNearestTokenLeft(cursorPos, getMask())
	}

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
