import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { useEscapeKey } from './useEscapeKey'

/** Создать тестовый компонент с useEscapeKey */
function createTestComponent(options: { isActive: () => boolean; callback: () => void }) {
	return defineComponent({
		setup() {
			useEscapeKey({
				isActive: options.isActive,
				callback: options.callback,
			})
			return () => h('div')
		},
	})
}

/** Создать событие клавиши */
function createKeyboardEvent(key: string): KeyboardEvent {
	return new KeyboardEvent('keydown', { key, bubbles: true })
}

describe('useEscapeKey', () => {
	const callback = vi.fn<() => void>()
	let isActiveFlag: boolean

	beforeEach(() => {
		callback.mockClear()
		isActiveFlag = true
	})

	it('должен вызвать callback при нажатии Escape', () => {
		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Escape'))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('не должен вызвать callback при нажатии другой клавиши', () => {
		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Enter'))

		expect(callback).not.toHaveBeenCalled()
	})

	it('не должен вызвать callback когда isActive=false', () => {
		isActiveFlag = false

		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Escape'))

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен отписаться от слушателя при размонтировании', () => {
		const { unmount } = render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		unmount()

		document.dispatchEvent(createKeyboardEvent('Escape'))

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен вызвать callback повторно при повторном нажатии Escape', () => {
		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Escape'))
		document.dispatchEvent(createKeyboardEvent('Escape'))

		expect(callback).toHaveBeenCalledTimes(2)
	})

	it('должен реагировать на изменение isActive', () => {
		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		isActiveFlag = false
		document.dispatchEvent(createKeyboardEvent('Escape'))
		expect(callback).not.toHaveBeenCalled()

		isActiveFlag = true
		document.dispatchEvent(createKeyboardEvent('Escape'))
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('не должен вызвать callback когда isActive=false и нажата не-Escape клавиша', () => {
		isActiveFlag = false

		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Tab'))

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен работать корректно после повторного монтирования', () => {
		const { unmount } = render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		unmount()

		render(
			createTestComponent({
				isActive: () => isActiveFlag,
				callback,
			}),
		)

		document.dispatchEvent(createKeyboardEvent('Escape'))

		expect(callback).toHaveBeenCalledTimes(1)
	})
})
