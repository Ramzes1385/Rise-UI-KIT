/**
 * Unit-тесты для BasePopover.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует BaseDropdown с teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import BasePopover from '../ui/BasePopover.vue'

/** Общие слоты для рендера */
const SLOTS = {
	trigger: '<button>Триггер</button>',
	default: '<p>Контент</p>',
}

describe('BasePopover unit', () => {
	describe('рендер', () => {
		it('должен рендерить popover-обёртку', () => {
			const { container } = render(BasePopover, {
				props: { isOpen: false },
				slots: SLOTS,
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

		it('должен рендерить контент слота default когда isOpen=true', () => {
			render(BasePopover, {
				props: { isOpen: true },
				slots: SLOTS,
			})

			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять вариант default по умолчанию', () => {
			render(BasePopover, {
				props: { isOpen: true },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--default')).toBeInTheDocument()
		})

		it('должен применять вариант outline когда variant=outline', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'outline' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--outline')).toBeInTheDocument()
		})

		it('должен применять вариант ghost когда variant=ghost', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'ghost' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--ghost')).toBeInTheDocument()
		})

		it('должен применять вариант shadow когда variant=shadow', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'shadow' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--shadow')).toBeInTheDocument()
		})

		it('должен применять вариант soft когда variant=soft', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'soft' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--soft')).toBeInTheDocument()
		})
	})

	describe('пропс position', () => {
		it('должен применять стрелку --bottom по умолчанию', () => {
			render(BasePopover, {
				props: { isOpen: true },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__arrow--bottom')).toBeInTheDocument()
		})

		it('должен применять стрелку --top когда position=top', () => {
			render(BasePopover, {
				props: { isOpen: true, position: 'top' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__arrow--top')).toBeInTheDocument()
		})

		it('должен применять стрелку --left когда position=left', () => {
			render(BasePopover, {
				props: { isOpen: true, position: 'left' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__arrow--left')).toBeInTheDocument()
		})

		it('должен применять стрелку --right когда position=right', () => {
			render(BasePopover, {
				props: { isOpen: true, position: 'right' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__arrow--right')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			render(BasePopover, {
				props: { isOpen: true, sizeScale: 100 },
				slots: SLOTS,
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel?.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			render(BasePopover, {
				props: { isOpen: true, sizeScale: 150 },
				slots: SLOTS,
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel?.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale=0.75 когда sizeScale=75', () => {
			render(BasePopover, {
				props: { isOpen: true, sizeScale: 75 },
				slots: SLOTS,
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel?.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('emit update:isOpen', () => {
		it('должен эмитить update:isOpen при клике на триггер', async () => {
			const { emitted, container } = render(BasePopover, {
				props: { isOpen: false },
				slots: SLOTS,
			})

			const trigger = container.querySelector('.base-popover__trigger') as HTMLElement
			await fireEvent.click(trigger)

			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events).toBeTruthy()
			expect(events.at(-1)?.[0]).toBe(true)
		})

		it('должен эмитить update:isOpen(false) при повторном клике на триггер', async () => {
			const { emitted, container } = render(BasePopover, {
				props: { isOpen: true },
				slots: SLOTS,
			})

			const trigger = container.querySelector('.base-popover__trigger') as HTMLElement
			await fireEvent.click(trigger)

			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(false)
		})

		it('должен корректно переключать состояние open→close→open', async () => {
			const { emitted, container } = render(BasePopover, {
				props: { isOpen: false },
				slots: SLOTS,
			})

			const trigger = container.querySelector('.base-popover__trigger') as HTMLElement
			await fireEvent.click(trigger)
			await fireEvent.click(trigger)
			await fireEvent.click(trigger)

			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events).toHaveLength(3)
			expect(events[0]?.[0]).toBe(true)
			expect(events[1]?.[0]).toBe(false)
			expect(events[2]?.[0]).toBe(true)
		})
	})

	describe('emit close', () => {
		it('должен эмитить close и update:isOpen(false) при закрытии через BaseDropdown', async () => {
			const { emitted } = render(BasePopover, {
				props: { isOpen: true },
				slots: SLOTS,
			})

			// Клик вне дропдауна вызывает handleClose в BaseDropdown
			await fireEvent.mouseDown(document.body)

			const updateEvents = emitted()['update:isOpen'] as boolean[][]
			expect(updateEvents).toBeTruthy()
			expect(updateEvents.at(-1)?.[0]).toBe(false)
			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('watch синхронизация', () => {
		it('должен синхронизировать isOpenLocal при внешнем изменении props.isOpen', async () => {
			const { rerender } = render(BasePopover, {
				props: { isOpen: false },
				slots: SLOTS,
			})

			expect(screen.queryByText('Контент')).not.toBeInTheDocument()

			await rerender({ isOpen: true })
			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('слот default', () => {
		it('не должен рендерить контент default-слота когда isOpen=false', () => {
			render(BasePopover, {
				props: { isOpen: false },
				slots: SLOTS,
			})

			expect(screen.queryByText('Контент')).not.toBeInTheDocument()
		})
	})

	describe('пропс color', () => {
		it('должен передавать color в BaseDropdown', () => {
			render(BasePopover, {
				props: { isOpen: true, color: { bg: { base: '#ff0000' } } },
				slots: SLOTS,
			})

			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			expect(panel?.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
		})
	})

	describe('panelClasses', () => {
		it('должен формировать CSS-класс панели с вариантом', () => {
			render(BasePopover, {
				props: { isOpen: true, variant: 'shadow' },
				slots: SLOTS,
			})

			expect(document.querySelector('.base-popover__panel--shadow')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BasePopover, {
				props: {
					isOpen: false,
					customClass: 'custom-root-class',
				},
				slots: SLOTS,
			})

			expect(container.querySelector('.base-dropdown')).toHaveClass('custom-root-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BasePopover, {
				props: {
					isOpen: true,
					customClass: {
						root: 'custom-root',
						trigger: 'custom-trigger',
						arrow: 'custom-arrow',
						inner: 'custom-inner',
						panel: 'custom-panel',
					},
				},
				slots: SLOTS,
			})

			expect(container.querySelector('.base-dropdown')).toHaveClass('custom-root')
			expect(container.querySelector('.base-popover__trigger')).toHaveClass('custom-trigger')
			expect(document.querySelector('.base-popover__arrow')).toHaveClass('custom-arrow')
			expect(document.querySelector('.base-popover__inner')).toHaveClass('custom-inner')
			expect(document.querySelector('.base-dropdown__panel')).toHaveClass('custom-panel')
		})
	})
})
