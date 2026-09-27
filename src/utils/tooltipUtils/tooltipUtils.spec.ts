import '@testing-library/jest-dom/vitest'
import { calcTooltipPosition, calcTooltipShift, getTooltipTransition, resolveTooltipPlacement } from './tooltipUtils'

describe('tooltipUtils', () => {
	const coords = { top: 100, left: 200, width: 50, height: 30 }

	describe('calcTooltipPosition', () => {
		it('позиционирует сверху', () => {
			const result = calcTooltipPosition({ position: 'top', coords })
			expect(result).toEqual({
				top: '92px',
				left: '225px',
			})
		})

		it('позиционирует снизу', () => {
			const result = calcTooltipPosition({ position: 'bottom', coords })
			expect(result).toEqual({
				top: '138px',
				left: '225px',
			})
		})

		it('позиционирует слева', () => {
			const result = calcTooltipPosition({ position: 'left', coords })
			expect(result).toEqual({
				top: '115px',
				left: '192px',
			})
		})

		it('позиционирует справа', () => {
			const result = calcTooltipPosition({ position: 'right', coords })
			expect(result).toEqual({
				top: '115px',
				left: '258px',
			})
		})

		it('использует кастомный gap', () => {
			const result = calcTooltipPosition({ position: 'top', coords, gap: 16 })
			expect(result.top).toBe('84px')
		})

		it('возвращает пустой объект для неизвестной позиции', () => {
			const result = calcTooltipPosition({ position: 'unknown' as 'top', coords })
			expect(result).toEqual({})
		})
	})

	describe('getTooltipTransition', () => {
		it('возвращает имя перехода по позиции', () => {
			expect(getTooltipTransition('top')).toBe('tooltip-top')
			expect(getTooltipTransition('bottom')).toBe('tooltip-bottom')
		})
	})

	describe('сдвиг вдоль края', () => {
		it('shift сдвигает точку по горизонтали для top/bottom и по вертикали для left/right', () => {
			const box = { top: 100, left: 200, width: 40, height: 20 }
			expect(calcTooltipPosition({ position: 'top', coords: box, shift: 12 }).left).toBe('232px')
			expect(calcTooltipPosition({ position: 'bottom', coords: box, shift: -12 }).left).toBe('208px')
			expect(calcTooltipPosition({ position: 'left', coords: box, shift: 5 }).top).toBe('115px')
			expect(calcTooltipPosition({ position: 'right', coords: box, shift: -5 }).top).toBe('105px')
		})
	})

	describe('resolveTooltipPlacement', () => {
		const viewport = { width: 1024, height: 768 }
		const size = { width: 120, height: 24 }

		it('остаётся на выбранной стороне, если там хватает места или не хватает и напротив; до измерения — тоже', () => {
			expect(resolveTooltipPlacement('top', { top: 300, left: 400, width: 80, height: 32 }, size, viewport)).toBe('top')
			expect(resolveTooltipPlacement('top', { top: 4, left: 400, width: 80, height: 760 }, size, viewport)).toBe('top')
			expect(resolveTooltipPlacement('top', { top: 4, left: 400, width: 80, height: 32 }, { width: 0, height: 0 }, viewport)).toBe('top')
		})

		it('переворачивается на противоположную сторону, если там помещается', () => {
			expect(resolveTooltipPlacement('top', { top: 4, left: 400, width: 80, height: 32 }, size, viewport)).toBe('bottom')
			expect(resolveTooltipPlacement('bottom', { top: 740, left: 400, width: 80, height: 24 }, size, viewport)).toBe('top')
			expect(resolveTooltipPlacement('left', { top: 300, left: 10, width: 40, height: 32 }, size, viewport)).toBe('right')
			expect(resolveTooltipPlacement('right', { top: 300, left: 980, width: 40, height: 32 }, size, viewport, 4)).toBe('left')
		})
	})

	describe('calcTooltipShift', () => {
		const viewport = { width: 1024, height: 768 }

		it('без сдвига, если подсказка помещается, и до измерения', () => {
			expect(calcTooltipShift('top', { top: 300, left: 400, width: 80, height: 32 }, { width: 120, height: 24 }, viewport)).toBe(0)
			expect(calcTooltipShift('top', { top: 300, left: 0, width: 10, height: 32 }, { width: 0, height: 0 }, viewport)).toBe(0)
		})

		it('у левого и правого края сдвигает внутрь с отступом 8px', () => {
			// центр 10, половина 60 → левый край подсказки должен быть на 8: центр 68
			expect(calcTooltipShift('bottom', { top: 300, left: 0, width: 20, height: 32 }, { width: 120, height: 24 }, viewport)).toBe(58)
			expect(calcTooltipShift('top', { top: 300, left: 1004, width: 20, height: 32 }, { width: 120, height: 24 }, viewport)).toBe(-58)
		})

		it('для left/right сдвигает по вертикали', () => {
			expect(calcTooltipShift('right', { top: 0, left: 300, width: 40, height: 10 }, { width: 120, height: 40 }, viewport)).toBe(23)
		})
	})
})
