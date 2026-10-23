import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { render } from '@testing-library/vue'
import BaseStepper from '../../ui/BaseStepper.vue'
import type { BaseStepperStep } from '../../types/BaseStepper.types'

const ITEMS: BaseStepperStep[] = [{ label: 'Корзина' }, { label: 'Доставка' }, { label: 'Оплата' }, { label: 'Подтверждение' }]

const STEP_WIDTH = 120

function mockLayout(scrollWidth: number, clientWidth: number) {
	vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth)
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(STEP_WIDTH)
	vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
		return [...(this.parentElement?.children ?? [])].indexOf(this) * STEP_WIDTH
	})
}

function mockReducedMotion(matches: boolean) {
	vi.stubGlobal('matchMedia', () => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
}

const scrollTo = vi.fn()

beforeEach(() => {
	Object.defineProperty(HTMLElement.prototype, 'scrollTo', { value: scrollTo, configurable: true, writable: true })
})

afterEach(() => {
	Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
	scrollTo.mockReset()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

async function renderStepper(props: Record<string, unknown> = {}) {
	const result = render(BaseStepper, { props: { modelValue: 1, items: ITEMS, ...props } })
	await nextTick()
	await nextTick()
	return { ...result, list: result.container.querySelector('.base-stepper__items') as HTMLElement }
}

describe('BaseStepper: прокрутка ленты', () => {
	it('лента помещается — без tabindex и без прокрутки', async () => {
		mockLayout(400, 400)
		const { list } = await renderStepper({ modelValue: 4, clickable: 'none' })
		expect(list).not.toHaveAttribute('tabindex')
		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('прокрутка при clickable=none — лента получает tabindex="0"', async () => {
		mockLayout(480, 300)
		const { list } = await renderStepper({ clickable: 'none' })
		expect(list).toHaveAttribute('tabindex', '0')
	})

	it('прокрутка с кнопками-шагами — tabindex не нужен', async () => {
		mockLayout(480, 300)
		const { list } = await renderStepper({ clickable: 'all' })
		expect(list).not.toHaveAttribute('tabindex')
	})

	it('при появлении прокрутки текущий шаг за правым краем прокручивается в видимую часть сразу', async () => {
		mockLayout(480, 300)
		await renderStepper({ modelValue: 4 })
		expect(scrollTo).toHaveBeenCalledWith({ left: 3 * STEP_WIDTH + STEP_WIDTH - 300, behavior: 'auto' })
	})

	it('текущий шаг уже виден — не прокручивает', async () => {
		mockLayout(480, 300)
		await renderStepper({ modelValue: 2 })
		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('смена шага — плавная прокрутка; шаг левее видимой части — к его началу', async () => {
		mockLayout(480, 300)
		const { list, rerender } = await renderStepper({ modelValue: 2 })
		list.scrollLeft = 180
		await rerender({ modelValue: 1 })
		expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
	})

	it('лента уже шага — шаг выравнивается по началу', async () => {
		mockLayout(480, 100)
		const { rerender } = await renderStepper({ modelValue: 1 })
		await rerender({ modelValue: 3 })
		expect(scrollTo).toHaveBeenLastCalledWith({ left: 2 * STEP_WIDTH, behavior: 'smooth' })
	})

	it('prefers-reduced-motion — смена шага без плавности', async () => {
		mockReducedMotion(true)
		mockLayout(480, 300)
		const { rerender } = await renderStepper({ modelValue: 1 })
		await rerender({ modelValue: 4 })
		expect(scrollTo).toHaveBeenCalledWith({ left: 180, behavior: 'auto' })
	})

	it('номер шага вне списка — прокручивает к ближайшему (последнему) шагу (ST-4)', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		mockLayout(480, 300)
		const { rerender } = await renderStepper({ modelValue: 1 })
		await rerender({ modelValue: 9 })
		expect(scrollTo).toHaveBeenCalledWith({ left: 180, behavior: 'smooth' })
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('modelValue 9 вне диапазона 1…4'))
	})

	it('без прокрутки смена шага не трогает ленту', async () => {
		mockLayout(400, 400)
		const { rerender } = await renderStepper({ modelValue: 1 })
		await rerender({ modelValue: 4 })
		expect(scrollTo).not.toHaveBeenCalled()
	})

	describe('RTL', () => {
		beforeEach(() => document.documentElement.setAttribute('dir', 'rtl'))
		afterEach(() => document.documentElement.removeAttribute('dir'))

		function mockRtlOffsets(clientWidth: number) {
			vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
				const index = [...(this.parentElement?.children ?? [])].indexOf(this)
				return clientWidth - (index + 1) * STEP_WIDTH
			})
		}

		it('шаг за левым краем: лента прокручивается в минус', async () => {
			mockLayout(480, 300)
			mockRtlOffsets(300)
			await renderStepper({ modelValue: 4 })
			expect(scrollTo).toHaveBeenCalledWith({ left: -180, behavior: 'auto' })
		})

		it('шаг ближе к началу, чем видимая часть: возврат к началу строки', async () => {
			mockLayout(480, 300)
			mockRtlOffsets(300)
			const { list, rerender } = await renderStepper({ modelValue: 2 })
			list.scrollLeft = -180
			await rerender({ modelValue: 1 })
			expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
		})
	})
})
