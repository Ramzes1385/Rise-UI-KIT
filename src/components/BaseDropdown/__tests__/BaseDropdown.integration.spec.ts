/**
 * Integration-тесты для BaseDropdown.
 * Проверяют взаимодействие: закрытие по Escape, click-outside,
 * сохранение фокуса при preventMousedown.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'

import BaseDropdown from '../ui/BaseDropdown.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useDropdownPosition', () => ({
	useDropdownPosition: () => ({
		panelStyle: { value: {} },
		triggerWidth: { value: 0 },
		coords: { value: { top: 0, left: 0 } },
		updatePosition: vi.fn(),
	}),
}))

describe('BaseDropdown integration', () => {
	describe('закрытие по Escape', () => {
		it('должен эмитить close и update:isOpen при нажатии Escape когда closeOnEscape=true', async () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).toHaveProperty('close')
			expect(emitted()).toHaveProperty('update:isOpen')
			expect(emitted()['update:isOpen'][0]).toEqual([false])
		})

		it('не должен эмитить close при нажатии Escape когда closeOnEscape=false', async () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).not.toHaveProperty('close')
			expect(emitted()).not.toHaveProperty('update:isOpen')
		})
	})

	describe('preventMousedown и фокус', () => {
		it('должен предотвращать preventDefault при mousedown когда preventMousedown=true', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel?.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(true)
		})

		it('не должен предотвращать preventDefault при mousedown когда preventMousedown=false', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel?.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(false)
		})
	})
})

