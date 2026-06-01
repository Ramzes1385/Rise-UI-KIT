/**
 * Unit-тесты для useTourLogic.
 * Логика тестируется в изоляции через эффект-скоуп Vue, чтобы покрыть
 * расчёт авторазмещения и поведение при отсутствии placement у пропов.
 */

import '@testing-library/jest-dom/vitest'
import { effectScope } from 'vue'

import type { EffectScope } from 'vue'

import type { BaseTourProps } from './BaseTour.types'
import { resolvePlacement, useTourLogic } from './useTourLogic'

function rectAt(top: number, left: number, width = 60, height = 40): DOMRect {
	return {
		top,
		left,
		right: left + width,
		bottom: top + height,
		width,
		height,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect
}

const RECT: DOMRect = {
	top: 500,
	left: 100,
	right: 160,
	bottom: 540,
	width: 60,
	height: 40,
	x: 100,
	y: 500,
	toJSON: () => ({}),
} as DOMRect

function mountTarget(): void {
	document.body.innerHTML = '<div id="t">T</div>'
}

const scopes: EffectScope[] = []

function runLogic(props: BaseTourProps, getIndex = () => 0): ReturnType<typeof useTourLogic> {
	const scope = effectScope()
	scopes.push(scope)
	return scope.run(() => useTourLogic({ props, getIndex })) as ReturnType<typeof useTourLogic>
}

describe('useTourLogic unit', () => {
	const originalInnerWidth = window.innerWidth
	const originalInnerHeight = window.innerHeight

	beforeEach(() => {
		mountTarget()
	})

	afterEach(() => {
		scopes.splice(0).forEach(scope => scope.stop())
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
	})

	describe('resolvePlacement', () => {
		it('возвращает заданную сторону без расчётов, если placement не auto', () => {
			expect(resolvePlacement(rectAt(100, 100), 'left')).toBe('left')
		})

		it('возвращает bottom, когда снизу максимум места', () => {
			Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
			expect(resolvePlacement(rectAt(100, 150), 'auto')).toBe('bottom')
		})

		it('возвращает top, когда сверху максимум места', () => {
			Object.defineProperty(window, 'innerWidth', { value: 220, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 560, configurable: true })
			expect(resolvePlacement(rectAt(500, 100), 'auto')).toBe('top')
		})

		it('возвращает right, когда справа максимум места', () => {
			Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 200, configurable: true })
			expect(resolvePlacement(rectAt(80, 20), 'auto')).toBe('right')
		})

		it('возвращает left, когда слева максимум места', () => {
			Object.defineProperty(window, 'innerWidth', { value: 780, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 160, configurable: true })
			expect(resolvePlacement(rectAt(100, 700), 'auto')).toBe('left')
		})
	})

	it('использует placement из пропа, когда у шага он не задан', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)

		const logic = runLogic({ steps: [{ target: '#t' }], placement: 'bottom' })
		await logic.recalculate()

		expect(logic.geometry.value?.placement).toBe('bottom')
	})

	it('применяет auto, когда не заданы ни шаг, ни проп placement', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })

		const logic = runLogic({ steps: [{ target: '#t' }] })
		await logic.recalculate()

		expect(logic.geometry.value).not.toBeNull()
		expect(logic.geometry.value?.placement).toBeDefined()
	})

	it('обнуляет геометрию, когда шаг вне диапазона', async () => {
		const logic = runLogic({ steps: [{ target: '#t' }] }, () => 5)
		await logic.recalculate()

		expect(logic.geometry.value).toBeNull()
	})

	it('обнуляет геометрию, когда целевой элемент не найден', async () => {
		const logic = runLogic({ steps: [{ target: '#missing' }] })
		await logic.recalculate()

		expect(logic.geometry.value).toBeNull()
	})
})
