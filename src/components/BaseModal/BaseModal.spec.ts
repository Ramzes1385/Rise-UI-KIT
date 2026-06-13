/**
 * Unit-тесты для BaseModal.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseModal from './BaseModal.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))
const { popupMock } = vi.hoisted(() => ({
	popupMock: {
		handleOverlayClick: vi.fn(),
		close: vi.fn(),
		onClose: null as (() => void) | null,
		lastOptions: null as Record<string, () => unknown> | null,
	},
}))

vi.mock('@composables/usePopup', () => ({
	usePopup: (options: {
		onClose: () => void
		isOpen: () => boolean
		closeOnOverlay: () => boolean
		closeOnEscape: () => boolean
		lockScroll: () => boolean
	}) => {
		popupMock.onClose = options.onClose
		popupMock.lastOptions = options as unknown as Record<string, () => unknown>
		// Вызываем геттеры — нужно для coverage функций-стрелок
		options.isOpen()
		options.closeOnOverlay()
		options.closeOnEscape()
		options.lockScroll()
		return { handleOverlayClick: popupMock.handleOverlayClick, close: popupMock.close }
	},
}))

describe('BaseModal unit', () => {
	beforeEach(() => {
		popupMock.handleOverlayClick.mockReset()
		popupMock.close.mockReset()
		popupMock.onClose = null
	})

	describe('рендер', () => {
		it('должен рендерить модал когда isOpen=true', () => {
			render(BaseModal, { props: { isOpen: true, title: 'Заголовок' } })

			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})

		it('не должен рендерить модал когда isOpen=false', () => {
			render(BaseModal, { props: { isOpen: false } })

			expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseModal, {
				props: { isOpen: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс title', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseModal, { props: { isOpen: true, title: 'Заголовок' } })

			expect(screen.getByText('Заголовок')).toBeInTheDocument()
		})

		it('не должен рендерить header когда title не передан', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal__header')).not.toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для default (useVariant пропускает default)', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--default')).toBe(false)
		})

		it('должен применять модификатор --ghost когда variant=ghost', () => {
			render(BaseModal, { props: { isOpen: true, variant: 'ghost', title: 'Ghost' } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--ghost')).toBe(true)
		})

		it('должен применять модификатор --shadow когда variant=shadow', () => {
			render(BaseModal, { props: { isOpen: true, variant: 'shadow', title: 'Shadow' } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--shadow')).toBe(true)
		})
	})

	describe('пропс isContained', () => {
		it('не должен применять модификатор --contained когда isContained=false', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--contained')).toBe(false)
		})

		it('должен применять модификатор --contained когда isContained=true', () => {
			render(BaseModal, { props: { isOpen: true, isContained: true } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--contained')).toBe(true)
		})

		it('должен рендерить на месте когда isContained=true (teleport отключён)', () => {
			const { container } = render(BaseModal, { props: { isOpen: true, isContained: true } })

			expect(container.querySelector('.base-modal')).toBeInTheDocument()
			expect(container.querySelector('.base-modal--contained')).toBeInTheDocument()
		})

		it('должен телепортировать в body когда isContained=false', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.body.querySelector('.base-modal')).toBeInTheDocument()
		})
	})

	describe('пропс hasOverlay', () => {
		it('не должен применять модификатор --no-overlay когда hasOverlay=true', () => {
			render(BaseModal, { props: { isOpen: true, hasOverlay: true } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--no-overlay')).toBe(false)
		})

		it('должен применять модификатор --no-overlay когда hasOverlay=false', () => {
			render(BaseModal, { props: { isOpen: true, hasOverlay: false } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--no-overlay')).toBe(true)
		})

		it('должен вернуть overlay после сброса hasOverlay=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseModal, {
				props: { isOpen: true, hasOverlay: false },
				attachTo: document.body,
			})

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--no-overlay')).toBe(true)

			await wrapper.setProps({ hasOverlay: undefined })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--no-overlay')).toBe(false)
			wrapper.unmount()
		})
	})

	describe('слот footer', () => {
		it('должен рендерить footer когда передан слот', () => {
			render(BaseModal, {
				props: { isOpen: true },
				slots: { footer: '<button>ОК</button>' },
			})

			expect(document.querySelector('.base-modal__footer')).toBeInTheDocument()
		})

		it('не должен рендерить footer когда слот не передан', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal__footer')).not.toBeInTheDocument()
		})
	})

	describe('пропс fullScreen', () => {
		it('не должен добавлять модификатор когда fullScreen не передан', () => {
			render(BaseModal, { props: { isOpen: true } })

			const modal = document.querySelector('.base-modal')
			expect(modal?.className).not.toMatch(/base-modal--fullscreen/)
		})

		it('должен применять модификатор --fullscreen-width', () => {
			render(BaseModal, { props: { isOpen: true, fullScreen: 'width' } })

			expect(document.querySelector('.base-modal--fullscreen-width')).toBeInTheDocument()
		})

		it('должен применять модификатор --fullscreen-height', () => {
			render(BaseModal, { props: { isOpen: true, fullScreen: 'height' } })

			expect(document.querySelector('.base-modal--fullscreen-height')).toBeInTheDocument()
		})

		it('должен применять модификатор --fullscreen-both', () => {
			render(BaseModal, { props: { isOpen: true, fullScreen: 'both' } })

			expect(document.querySelector('.base-modal--fullscreen-both')).toBeInTheDocument()
		})
	})

	describe('пропс closeOnOverlay', () => {
		it('должен возвращать false когда closeOnOverlay=false', () => {
			render(BaseModal, { props: { isOpen: true, closeOnOverlay: false } })

			expect(popupMock.lastOptions?.closeOnOverlay()).toBe(false)
		})

		it('должен возвращать true когда closeOnOverlay=true', () => {
			render(BaseModal, { props: { isOpen: true, closeOnOverlay: true } })

			expect(popupMock.lastOptions?.closeOnOverlay()).toBe(true)
		})

		it('должен возвращать true (default) когда closeOnOverlay не передан', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(popupMock.lastOptions?.closeOnOverlay()).toBe(true)
		})

		it('должен возвращать true когда closeOnOverlay=null (ветка ?? true)', () => {
			render(BaseModal, {
				// @ts-expect-error — проверяем рантайм-ветку `?? true` при null
				props: { isOpen: true, closeOnOverlay: null },
			})

			expect(popupMock.lastOptions?.closeOnOverlay()).toBe(true)
		})

		it('должен передавать closeOnOverlay в usePopup', () => {
			render(BaseModal, { props: { isOpen: true, closeOnOverlay: false } })

			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
	})

	describe('emit confirm', () => {
		it('не должен эмитить confirm при закрытии через кнопку', async () => {
			const { emitted } = render(BaseModal, { props: { isOpen: true, title: 'Тест' } })

			const closeBtn = document.querySelector('.base-modal__close') as HTMLElement
			closeBtn.click()

			expect(emitted()).not.toHaveProperty('confirm')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=100', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			render(BaseModal, { props: { isOpen: true, sizeScale: 150 } })

			expect(document.querySelector('.base-modal')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			render(BaseModal, { props: { isOpen: true, sizeScale: 75 } })

			expect(document.querySelector('.base-modal')?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})

	describe('пропс color', () => {
		it('должен применять customColorStyle когда color передан', () => {
			render(BaseModal, {
				props: { isOpen: true, color: { bg: { base: '#ff0000' }, text: { base: '#ffffff' } } },
			})

			const style = document.querySelector('.base-modal')?.getAttribute('style') ?? ''
			expect(style.length).toBeGreaterThan(0)
		})
	})

	describe('клик по оверлею', () => {
		it('должен вызывать handleOverlayClick при клике на оверлей', async () => {
			render(BaseModal, { props: { isOpen: true } })

			const overlay = document.querySelector('.base-modal') as HTMLElement
			overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))

			expect(popupMock.handleOverlayClick).toHaveBeenCalled()
		})
	})

	describe('эвенты update:isOpen и close', () => {
		it('должен эмитить update:isOpen(false) при закрытии', () => {
			const { emitted } = render(BaseModal, { props: { isOpen: true, title: 'Тест' } })

			popupMock.onClose?.()

			expect(emitted()).toHaveProperty('update:isOpen')
			expect(emitted()['update:isOpen'][0]).toEqual([false])
		})

		it('должен эмитить close при закрытии', () => {
			const { emitted } = render(BaseModal, { props: { isOpen: true, title: 'Тест' } })

			popupMock.onClose?.()

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			render(BaseModal, {
				props: {
					isOpen: true,
					customClass: 'custom-root-class',
				},
			})

			expect(document.querySelector('.base-modal')).toHaveClass('custom-root-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			render(BaseModal, {
				props: {
					isOpen: true,
					title: 'Заголовок',
					customClass: {
						root: 'custom-root',
						content: 'custom-content',
						header: 'custom-header',
						headerLeft: 'custom-header-left',
						title: 'custom-title',
						close: 'custom-close',
						body: 'custom-body',
						footer: 'custom-footer',
					},
				},
				slots: {
					footer: '<div>Подвал</div>',
				},
			})

			expect(document.querySelector('.base-modal')).toHaveClass('custom-root')
			expect(document.querySelector('.base-modal__content')).toHaveClass('custom-content')
			expect(document.querySelector('.base-modal__header')).toHaveClass('custom-header')
			expect(document.querySelector('.base-modal__header-left')).toHaveClass('custom-header-left')
			expect(document.querySelector('.base-modal__title')).toHaveClass('custom-title')
			expect(document.querySelector('.base-modal__close')).toHaveClass('custom-close')
			expect(document.querySelector('.base-modal__body')).toHaveClass('custom-body')
			expect(document.querySelector('.base-modal__footer')).toHaveClass('custom-footer')
		})
	})
})
