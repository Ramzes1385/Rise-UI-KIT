/** Логика тестируется в изоляции через эффект-скоуп Vue, чтобы покрыть расчёт авторазмещения и поведение при отсутствии placement у пропов. */

import '@testing-library/jest-dom/vitest'
import type { EffectScope } from 'vue'
import { mount } from '@vue/test-utils'
import { resolvePlacement, useTourLogic } from '../useTourLogic'
import { defineComponent, effectScope, nextTick, ref } from 'vue'
import type { BaseTourProps } from '@components/BaseTour/types/BaseTour.types'

/** Прямоугольник элемента 60×40 в точке (top, left) */
function rectAt(top: number, left: number): DOMRect {
	const width = 60
	const height = 40
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

	describe('шаг без цели (TOUR-3)', () => {
		it.each([
			['без селектора', undefined],
			['неверный селектор', '###'],
			['элемента нет', '#missing'],
		])('%s — геометрии нет, карточка по центру', async (_, target) => {
			const logic = runLogic({ steps: [{ target, title: 'A' }] } as BaseTourProps)
			await logic.recalculate()
			expect(logic.geometry.value).toBeNull()
			expect(logic.isCentered.value).toBe(true)
			expect(logic.getTarget()).toBeNull()
		})

		it('цель есть — getTarget возвращает её, карточка не по центру', async () => {
			const logic = runLogic({ steps: [{ target: '#t' }] } as BaseTourProps)
			await logic.recalculate()
			expect(logic.isCentered.value).toBe(false)
			expect(logic.getTarget()).toBe(document.querySelector('#t'))
		})

		it('шага нет — не по центру и без геометрии', async () => {
			const logic = runLogic({ steps: [] } as unknown as BaseTourProps)
			await logic.recalculate()
			expect(logic.isCentered.value).toBe(false)
			expect(logic.geometry.value).toBeNull()
		})
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
	it('считает общее число шагов и крайние позиции по текущему индексу', () => {
		const index = ref(0)
		const logic = runLogic({ steps: [{ target: '#t' }, { target: '#t' }, { target: '#t' }] }, () => index.value)

		expect(logic.total.value).toBe(3)
		expect([logic.isFirst.value, logic.isLast.value]).toEqual([true, false])

		index.value = 2
		expect([logic.isFirst.value, logic.isLast.value]).toEqual([false, true])
		expect(logic.currentStep.value).toEqual({ target: '#t' })
	})

	it('ставит карточку над целью и слева от неё по заданной стороне шага', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)

		const top = runLogic({ steps: [{ target: '#t', placement: 'top' }], padding: 4, gap: 10 })
		await top.recalculate()
		expect(top.geometry.value).toEqual({
			spotlight: { top: 496, left: 96, width: 68, height: 48 },
			card: { top: 490, left: 130 },
			placement: 'top',
		})

		const left = runLogic({ steps: [{ target: '#t', placement: 'left' }] })
		await left.recalculate()
		expect(left.geometry.value?.card).toEqual({ top: 520, left: 88 })
	})

	it('не прокручивает к цели, когда behavior.scrollIntoView = false', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
		const scrollIntoView = vi.fn()
		HTMLElement.prototype.scrollIntoView = scrollIntoView

		const logic = runLogic({ steps: [{ target: '#t' }], behavior: { scrollIntoView: false } })
		await logic.recalculate()
		expect(scrollIntoView).not.toHaveBeenCalled()

		const scrolling = runLogic({ steps: [{ target: '#t' }] })
		await scrolling.recalculate()
		expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center', inline: 'center' })

		Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
	})

	it('пересчитывает геометрию при смене шага', async () => {
		const index = ref(0)
		const logic = runLogic({ steps: [{ target: '#t' }, { target: '#missing' }] }, () => index.value)
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
		await logic.recalculate()
		expect(logic.geometry.value).not.toBeNull()

		index.value = 1
		await nextTick()
		await nextTick()
		await nextTick()
		expect(logic.geometry.value).toBeNull()
	})

	it('снимает слушатели окна при размонтировании компонента', () => {
		const removeEventListener = vi.spyOn(window, 'removeEventListener')
		let logic: ReturnType<typeof useTourLogic> | undefined
		const wrapper = mount(
			defineComponent({
				setup() {
					logic = useTourLogic({ props: { steps: [{ target: '#t' }] }, getIndex: () => 0 })
					return () => null
				},
			}),
		)
		logic!.attachListeners()

		wrapper.unmount()

		expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
		expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true)
	})
})
