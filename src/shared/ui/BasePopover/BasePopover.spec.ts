/**
 * Unit-тесты для BasePopover.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует BaseDropdown с teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BasePopover from './BasePopover.vue'

describe('BasePopover unit', () => {
	describe('рендер', () => {
		it('должен рендерить popover-обёртку', () => {
			const { container } = render(BasePopover, {
				props: { isOpen: false },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			expect(container.querySelector('.base-popover__trigger')).toBeInTheDocument()
		})

		it('должен рендерить триггер-слот', () => {
			render(BasePopover, {
				props: { isOpen: false },
				slots: { trigger: '<button>Триггер</button>' },
			})

			expect(screen.getByText('Триггер')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять вариант default по умолчанию', () => {
			render(BasePopover, {
				props: { isOpen: true },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			expect(document.querySelector('.base-popover__panel--default')).toBeInTheDocument()
		})

		it('должен применять вариант accent когда variant=accent', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'accent' },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			expect(document.querySelector('.base-popover__panel--accent')).toBeInTheDocument()
		})
	})
})
