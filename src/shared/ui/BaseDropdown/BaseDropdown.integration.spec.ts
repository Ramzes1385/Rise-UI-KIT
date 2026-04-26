/**
 * Integration-тесты для BaseDropdown.
 * Проверяют взаимодействие: закрытие по Escape.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'

import BaseDropdown from './BaseDropdown.vue'

describe('BaseDropdown integration', () => {
	describe('закрытие по Escape', () => {
		it('должен эмитить close при нажатии Escape когда closeOnEscape=true', async () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).toHaveProperty('close')
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
		})
	})
})
