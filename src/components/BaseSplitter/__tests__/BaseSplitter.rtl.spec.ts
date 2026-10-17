import '@testing-library/jest-dom/vitest'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function setup() {
	const result = render(BaseSplitter, { slots: { start: 'Письма', end: 'Письмо' } })
	const root = result.container.querySelector('.base-splitter') as HTMLElement
	root.getBoundingClientRect = () => ({ left: 0, right: 200, width: 200, top: 0, bottom: 100, height: 100, x: 0, y: 0 }) as DOMRect
	const updates = () => (result.emitted()['update:modelValue'] ?? []).map(args => (args as number[])[0])
	return { separator: screen.getByRole('separator'), updates }
}

describe('BaseSplitter в RTL', () => {
	beforeEach(() => document.documentElement.setAttribute('dir', 'rtl'))
	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('← увеличивает первую панель, → уменьшает', async () => {
		const { separator, updates } = setup()
		await fireEvent.keyDown(separator, { key: 'ArrowLeft' })
		await fireEvent.keyDown(separator, { key: 'ArrowRight' })
		expect(updates()).toEqual([55, 50])
	})

	it('перетаскивание: размер первой панели считается от правого края', async () => {
		const { separator, updates } = setup()
		await fireEvent.pointerDown(separator, { button: 0, pointerId: 1 })
		await fireEvent.pointerMove(separator, { clientX: 60 })
		await fireEvent.pointerUp(separator)
		expect(updates()).toEqual([70])
	})
})
