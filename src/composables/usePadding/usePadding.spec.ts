/**
 * Unit-тесты для composable usePadding.
 * Проверяют разрешение number|object в четыре стороны и CSS-переменные.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'

import { resolvePadding, usePadding } from './usePadding'

describe('resolvePadding', () => {
	describe('число (шорткат)', () => {
		it('должен задавать top/bottom = n, left/right = n × 2 по умолчанию', () => {
			expect(resolvePadding(10, 2).values).toEqual({ top: 10, right: 20, bottom: 10, left: 20 })
		})

		it('должен учитывать произвольный множитель оси', () => {
			expect(resolvePadding(12, 1).values).toEqual({ top: 12, right: 12, bottom: 12, left: 12 })
		})

		it('должен отмечать выведенными только горизонтальные стороны', () => {
			expect(resolvePadding(10, 2).sides).toEqual({ top: false, right: true, bottom: false, left: true })
		})
	})

	describe('объект — оси', () => {
		it('должен задавать пары сторон из x и y', () => {
			expect(resolvePadding({ x: 20, y: 10 }, 2).values).toEqual({ top: 10, right: 20, bottom: 10, left: 20 })
		})

		it('должен задавать произвольные x и y напрямую без умножения', () => {
			expect(resolvePadding({ x: 25, y: 43 }, 2).values).toEqual({ top: 43, right: 25, bottom: 43, left: 25 })
		})

		it('должен использовать 0 для незаданных осей', () => {
			expect(resolvePadding({ x: 16 }, 2).values).toEqual({ top: 0, right: 16, bottom: 0, left: 16 })
		})

		it('должен отмечать выведенными только стороны заданной оси', () => {
			expect(resolvePadding({ x: 16 }, 2).sides).toEqual({ top: false, right: true, bottom: false, left: true })
		})
	})

	describe('объект — приоритет сторон над осями', () => {
		it('должен переопределять left точечным значением поверх x', () => {
			expect(resolvePadding({ x: 10, left: 40 }, 2).values).toEqual({ top: 0, right: 10, bottom: 0, left: 40 })
		})

		it('должен переопределять top точечным значением поверх y', () => {
			expect(resolvePadding({ y: 8, top: 24 }, 2).values).toEqual({ top: 24, right: 0, bottom: 8, left: 0 })
		})

		it('должен поддерживать все четыре стороны', () => {
			expect(resolvePadding({ top: 1, right: 2, bottom: 3, left: 4 }, 2).values).toEqual({
				top: 1,
				right: 2,
				bottom: 3,
				left: 4,
			})
		})
	})
})

describe('usePadding', () => {
	it('должен формировать четыре CSS-переменные с префиксом', () => {
		const { paddingStyle } = usePadding({ getPadding: () => 10, prefix: '--btn-pad' })

		expect(paddingStyle.value).toEqual({
			'--btn-pad-top': '10px',
			'--btn-pad-right': '20px',
			'--btn-pad-bottom': '10px',
			'--btn-pad-left': '20px',
		})
	})

	it('должен использовать defaultPadding когда значение не задано', () => {
		const { paddingStyle } = usePadding({ getPadding: () => undefined, prefix: '--card-pad', defaultPadding: 24 })

		expect(paddingStyle.value).toEqual({
			'--card-pad-top': '24px',
			'--card-pad-right': '48px',
			'--card-pad-bottom': '24px',
			'--card-pad-left': '48px',
		})
	})

	it('должен поддерживать объектное значение с точечными сторонами', () => {
		const { paddingStyle } = usePadding({ getPadding: () => ({ x: 16, top: 8 }), prefix: '--dd-pad' })

		expect(paddingStyle.value).toEqual({
			'--dd-pad-top': '8px',
			'--dd-pad-right': '16px',
			'--dd-pad-bottom': '0px',
			'--dd-pad-left': '16px',
		})
	})

	describe('omitUnsetSides', () => {
		it('должен выставлять только горизонталь для числа', () => {
			const { paddingStyle } = usePadding({
				getPadding: () => 24,
				prefix: '--slideover-pad',
				axisMultiplier: 1,
				omitUnsetSides: true,
			})

			expect(paddingStyle.value).toEqual({
				'--slideover-pad-right': '24px',
				'--slideover-pad-left': '24px',
			})
		})

		it('должен выставлять вертикаль при объекте с top/bottom', () => {
			const { paddingStyle } = usePadding({
				getPadding: () => ({ x: 20, top: 8, bottom: 12 }),
				prefix: '--slideover-pad',
				axisMultiplier: 1,
				omitUnsetSides: true,
			})

			expect(paddingStyle.value).toEqual({
				'--slideover-pad-top': '8px',
				'--slideover-pad-right': '20px',
				'--slideover-pad-bottom': '12px',
				'--slideover-pad-left': '20px',
			})
		})

		it('должен опускать горизонталь, когда заданы только вертикальные стороны', () => {
			const { paddingStyle } = usePadding({
				getPadding: () => ({ y: 10 }),
				prefix: '--slideover-pad',
				axisMultiplier: 1,
				omitUnsetSides: true,
			})

			expect(paddingStyle.value).toEqual({
				'--slideover-pad-top': '10px',
				'--slideover-pad-bottom': '10px',
			})
		})
	})

	it('должен использовать 0, когда не заданы ни значение, ни defaultPadding', () => {
		const { paddingStyle } = usePadding({ getPadding: () => undefined, prefix: '--zero-pad' })

		expect(paddingStyle.value).toEqual({
			'--zero-pad-top': '0px',
			'--zero-pad-right': '0px',
			'--zero-pad-bottom': '0px',
			'--zero-pad-left': '0px',
		})
	})

	it('должен быть реактивным', () => {
		const padding = ref<number | { x?: number; y?: number }>(8)
		const { paddingStyle } = usePadding({ getPadding: () => padding.value, prefix: '--x-pad' })

		expect(paddingStyle.value['--x-pad-left']).toBe('16px')

		padding.value = { x: 4, y: 4 }
		expect(paddingStyle.value['--x-pad-left']).toBe('4px')
		expect(paddingStyle.value['--x-pad-top']).toBe('4px')
	})
})
