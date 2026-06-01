import '@testing-library/jest-dom/vitest'

import { calcTooltipPosition, getTooltipTransition } from './tooltipUtils'

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
})
