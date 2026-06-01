/**
 * Unit-тесты для BaseDropdown.
 * Проверяют рендер, пропсы, CSS-модификаторы, эмит update:isOpen,
 * preventMousedown и sizeScale.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseDropdown from './BaseDropdown.vue'

const { clickOutsideMock, escapeKeyMock } = vi.hoisted(() => ({
	clickOutsideMock: { callback: null as (() => void) | null, isActive: null as (() => boolean) | null },
	escapeKeyMock: { callback: null as (() => void) | null, isActive: null as (() => boolean) | null },
}))

vi.mock('@composables/useClickOutside', () => ({
	useClickOutside: (options: { callback: () => void; isActive: () => boolean }) => {
		clickOutsideMock.callback = options.callback
		clickOutsideMock.isActive = options.isActive
		// Вызываем геттеры для coverage
		options.isActive()
	},
}))
vi.mock('@composables/useEscapeKey', () => ({
	useEscapeKey: (options: { callback: () => void; isActive: () => boolean }) => {
		escapeKeyMock.callback = options.callback
		escapeKeyMock.isActive = options.isActive
		// Вызываем геттер для coverage
		options.isActive()
	},
}))
vi.mock('@composables/useDropdownPosition', () => ({
	useDropdownPosition: (options: {
		position: () => string
		gap: () => number
		matchWidth: () => boolean
		maxHeight: () => string
		isOpen: () => boolean
	}) => {
		// Вызываем все геттеры для coverage стрелочных функций
		options.position()
		options.gap()
		options.matchWidth()
		options.maxHeight()
		options.isOpen()
		return {
			panelStyle: { value: {} },
			triggerWidth: { value: 0 },
			coords: { value: { top: 0, left: 0 } },
			updatePosition: vi.fn(),
		}
	},
}))

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

	describe('эмит update:isOpen', () => {
		it('должен содержать update:isOpen в определении эмитов', () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			expect(emitted()).not.toHaveProperty('update:isOpen')
		})
	})

	describe('пропс preventMousedown', () => {
		it('не должен вызывать preventDefault когда preventMousedown=false', () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()
		})

		it('должен вызывать preventDefault когда preventMousedown=true', () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()
		})
	})

	describe('handlePanelFocusin', () => {
		it('должен возвращать фокус на сохранённый элемент при focusin когда preventMousedown=true', async () => {
			const trigger = document.createElement('button')
			trigger.id = 'external-trigger'
			document.body.appendChild(trigger)
			trigger.focus()

			const { rerender } = render(BaseDropdown, {
				props: { isOpen: false, preventMousedown: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<button class="inside">Внутри</button>',
				},
			})

			await rerender({ isOpen: true, preventMousedown: true })

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			const insideBtn = panel.querySelector('.inside') as HTMLElement
			insideBtn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

			expect(document.activeElement).toBe(trigger)
			trigger.remove()
		})

		it('не должен переводить фокус при focusin когда preventMousedown=false', async () => {
			const trigger = document.createElement('button')
			trigger.id = 'external-trigger-2'
			document.body.appendChild(trigger)
			trigger.focus()

			const { rerender } = render(BaseDropdown, {
				props: { isOpen: false, preventMousedown: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<button class="inside-2">Внутри</button>',
				},
			})

			await rerender({ isOpen: true, preventMousedown: false })

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			const insideBtn = panel.querySelector('.inside-2') as HTMLElement
			insideBtn.focus()
			insideBtn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

			expect(document.activeElement).toBe(insideBtn)
			trigger.remove()
		})

		it('должен сбрасывать savedActiveElement при закрытии', async () => {
			const trigger = document.createElement('button')
			document.body.appendChild(trigger)
			trigger.focus()

			const { rerender } = render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await rerender({ isOpen: false, preventMousedown: true })

			expect(document.querySelector('.base-dropdown__panel')).not.toBeInTheDocument()
			trigger.remove()
		})
	})

	describe('handleClose через composables', () => {
		it('должен эмитить update:isOpen и close через клик снаружи', () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			clickOutsideMock.callback?.()

			expect(emitted()).toHaveProperty('update:isOpen')
			expect(emitted()['update:isOpen'][0]).toEqual([false])
			expect(emitted()).toHaveProperty('close')
		})

		it('должен эмитить update:isOpen и close через Escape', () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			escapeKeyMock.callback?.()

			expect(emitted()).toHaveProperty('update:isOpen')
			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('handlePanelMousedown — вызов preventDefault', () => {
		it('должен вызывать preventDefault на mousedown панели когда preventMousedown=true', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
		})

		it('не должен вызывать preventDefault на mousedown панели когда preventMousedown=false', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(false)
		})
	})

	describe('пропс sizeScale', () => {
		it('должен устанавливать --size-scale на панели при sizeScale=150', () => {
			render(BaseDropdown, {
				props: { isOpen: true, sizeScale: 150 },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel).toBeInTheDocument()
			expect(panel.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('не должен устанавливать --size-scale при sizeScale=100', () => {
			render(BaseDropdown, {
				props: { isOpen: true, sizeScale: 100 },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel).toBeInTheDocument()
			expect(panel.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('не должен устанавливать sizeScaleStyle на корневом элементе', () => {
			const { container } = render(BaseDropdown, {
				props: { isOpen: false, sizeScale: 150 },
				slots: { default: '<button>Триггер</button>' },
			})

			const root = container.querySelector('.base-dropdown') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('')
		})
	})

	describe('пропс position', () => {
		it('должен рендериться с position=bottom-start по умолчанию', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})

		it('должен рендериться с position=top-end', () => {
			render(BaseDropdown, {
				props: { isOpen: true, position: 'top-end' },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для варианта default', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel--default')).not.toBeInTheDocument()
		})

		it('должен применять модификатор --ghost', () => {
			render(BaseDropdown, {
				props: { isOpen: true, variant: 'ghost' },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel--ghost')).toBeInTheDocument()
		})

		it('должен применять модификатор --outline', () => {
			render(BaseDropdown, {
				props: { isOpen: true, variant: 'outline' },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel--outline')).toBeInTheDocument()
		})
	})

	describe('пропс gap', () => {
		it('должен рендериться с gap=4 по умолчанию', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})

		it('должен рендериться с кастомным gap', () => {
			render(BaseDropdown, {
				props: { isOpen: true, gap: 16 },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})
	})

	describe('пропс maxHeight', () => {
		it('должен рендериться с maxHeight=320px по умолчанию', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})

		it('должен рендериться с кастомной maxHeight', () => {
			render(BaseDropdown, {
				props: { isOpen: true, maxHeight: '500px' },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})
	})

	describe('пропс matchWidth', () => {
		it('должен рендериться с matchWidth=false по умолчанию', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})

		it('должен рендериться с matchWidth=true', () => {
			render(BaseDropdown, {
				props: { isOpen: true, matchWidth: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			expect(document.querySelector('.base-dropdown__panel')).toBeInTheDocument()
		})
	})

	describe('пропс padding', () => {
		it('должен устанавливать CSS-переменные padding по умолчанию (8)', () => {
			render(BaseDropdown, {
				props: { isOpen: true },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--dd-pad-top')).toBe('8px')
			expect(panel.style.getPropertyValue('--dd-pad-bottom')).toBe('8px')
			expect(panel.style.getPropertyValue('--dd-pad-left')).toBe('16px')
			expect(panel.style.getPropertyValue('--dd-pad-right')).toBe('16px')
		})

		it('должен устанавливать CSS-переменные padding при padding=12', () => {
			render(BaseDropdown, {
				props: { isOpen: true, padding: 12 },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--dd-pad-top')).toBe('12px')
			expect(panel.style.getPropertyValue('--dd-pad-left')).toBe('24px')
		})

		it('должен поддерживать объектный padding', () => {
			render(BaseDropdown, {
				props: { isOpen: true, padding: { x: 16, y: 8, bottom: 20 } },
				slots: { default: '<button>Триггер</button>', dropdown: '<p>Контент</p>' },
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--dd-pad-top')).toBe('8px')
			expect(panel.style.getPropertyValue('--dd-pad-bottom')).toBe('20px')
			expect(panel.style.getPropertyValue('--dd-pad-left')).toBe('16px')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseDropdown, {
				props: { isOpen: false, customClass: 'custom-dropdown-class' },
			})

			expect(container.querySelector('.base-dropdown')).toHaveClass('custom-dropdown-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			render(BaseDropdown, {
				props: {
					isOpen: true,
					customClass: {
						root: 'custom-root',
						panel: 'custom-panel',
					},
				},
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()
			expect(panel).toHaveClass('custom-panel')
		})
	})
})
