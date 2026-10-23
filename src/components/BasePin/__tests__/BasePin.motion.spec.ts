import '@testing-library/jest-dom/vitest'
import BasePin from '../ui/BasePin.vue'
import { fireEvent, render } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function renderPin(modelValue = '') {
	const view = render(BasePin, { props: { modelValue, 'onUpdate:modelValue': (value: string) => view.rerender({ modelValue: value }) } })
	return { ...view, inputs: [...view.container.querySelectorAll<HTMLInputElement>('.base-pin__input')] }
}

function paste(input: HTMLInputElement, text: string) {
	const event = new Event('paste', { bubbles: true, cancelable: true })
	Object.assign(event, { clipboardData: { getData: () => text } })
	return fireEvent(input, event)
}

describe('BasePin: движение', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('заполненная ячейка отмечена классом --filled, при монтировании без анимации', () => {
		const { inputs } = renderPin('1')

		expect(inputs[0]).toHaveClass('base-pin__input--filled')
		expect(inputs[0]).not.toHaveClass('base-pin__input--pop')
		expect(inputs[1]).not.toHaveClass('base-pin__input--filled')
	})

	it('значение снаружи (v-model) отмечает новые и заменённые символы', async () => {
		const { inputs, rerender } = renderPin('12')

		await rerender({ modelValue: '1934' })
		expect(inputs.map(input => input.classList.contains('base-pin__input--pop'))).toEqual([false, true, true, true])
	})

	it('введённый символ отмечает ячейку анимацией, animationend её снимает', async () => {
		const { inputs } = renderPin()

		await fireEvent.update(inputs[0], '5')
		expect(inputs[0]).toHaveClass('base-pin__input--pop', 'base-pin__input--filled')
		expect(inputs[1]).not.toHaveClass('base-pin__input--pop')

		await fireEvent.animationEnd(inputs[0])
		expect(inputs[0]).not.toHaveClass('base-pin__input--pop')
	})

	it('без animationend класс снимает страховочный таймер', async () => {
		vi.useFakeTimers()
		const { inputs } = renderPin()

		await fireEvent.update(inputs[1], '7')
		expect(inputs[1]).toHaveClass('base-pin__input--pop')

		await vi.advanceTimersByTimeAsync(1000)
		expect(inputs[1]).not.toHaveClass('base-pin__input--pop')
	})

	it('вставка отмечает все заполненные ячейки', async () => {
		const { inputs } = renderPin()

		await paste(inputs[0], '123')
		expect(inputs.slice(0, 3).every(input => input.classList.contains('base-pin__input--pop'))).toBe(true)
		expect(inputs[3]).not.toHaveClass('base-pin__input--pop')
	})

	it('стирание и пустая вставка не запускают анимацию', async () => {
		const { inputs } = renderPin('1')

		await fireEvent.update(inputs[0], '')
		await paste(inputs[0], '   ')
		expect(inputs.some(input => input.classList.contains('base-pin__input--pop'))).toBe(false)
	})

	it('prefers-reduced-motion: reduce — сразу конечное состояние, без анимации', async () => {
		stubReducedMotion(true)
		const { inputs } = renderPin()

		await fireEvent.update(inputs[0], '5')
		expect(inputs[0]).toHaveClass('base-pin__input--filled')
		expect(inputs[0]).not.toHaveClass('base-pin__input--pop')
	})

	it('пресет none — сразу конечное состояние', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { inputs } = renderPin()

		await paste(inputs[0], '1234')
		expect(inputs.every(input => input.classList.contains('base-pin__input--filled'))).toBe(true)
		expect(inputs.some(input => input.classList.contains('base-pin__input--pop'))).toBe(false)
	})
})
