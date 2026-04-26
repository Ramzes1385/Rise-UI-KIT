/**
 * Unit-тесты для BaseDropdown.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseDropdown from './BaseDropdown.vue'

describe('BaseDropdown unit', () => {
	describe('рендер', () => {
		it('должен рендерить обёртку', () => {
			const { container } = render(BaseDropdown, {
				props: { isOpen: false },
				slots: { default: '<button>Триггер</button>' },
			})

			expect(container.querySelector('.base-dropdown')).toBeInTheDocument()
		})

		it('должен рендерить триггер-слот', () => {
			render(BaseDropdown, {
				props: { isOpen: false },
				slots: { default: '<button>Триггер</button>' },
			})

			expect(screen.getByText('Триггер')).toBeInTheDocument()
		})

		it('должен рендерить панель когда isOpen=true', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})

		it('не должен рендерить панель когда isOpen=false', () => {
			render(BaseDropdown, {
				props: { isOpen: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			expect(document.querySelector('.base-dropdown__panel')).not.toBeInTheDocument()
		})
	})

	describe('пропс panelClass', () => {
		it('должен применять panelClass к панели', () => {
			render(BaseDropdown, {
				props: { isOpen: true, panelClass: 'custom-class' },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			expect(document.querySelector('.base-dropdown__panel')?.classList.contains('custom-class')).toBe(true)
		})
	})
})
