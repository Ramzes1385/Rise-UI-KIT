/**
 * Unit-тесты для BaseSlideover.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует teleport — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSlideover from './BaseSlideover.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))
vi.mock('@composables/usePopup', () => ({
	usePopup: () => ({ handleOverlayClick: vi.fn(), close: vi.fn() }),
}))

describe('BaseSlideover unit', () => {
	describe('рендер', () => {
		it('должен рендерить slideover когда isOpen=true', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			expect(document.querySelector('.base-slideover')).toBeInTheDocument()
		})

		it('не должен рендерить slideover когда isOpen=false', () => {
			render(BaseSlideover, { props: { isOpen: false } })

			expect(document.querySelector('.base-slideover')).not.toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseSlideover, {
				props: { isOpen: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс title', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseSlideover, { props: { isOpen: true, title: 'Панель' } })

			expect(screen.getByText('Панель')).toBeInTheDocument()
		})

		it('должен рендерить header когда есть title', () => {
			render(BaseSlideover, { props: { isOpen: true, title: 'Панель' } })

			expect(document.querySelector('.base-slideover__header')).toBeInTheDocument()
		})
	})

	describe('слот header', () => {
		it('должен рендерить кастомный header без title когда передан слот header', () => {
			render(BaseSlideover, {
				props: { isOpen: true },
				slots: { header: '<div class="custom-header">Кастомная шапка</div>' },
			})

			expect(document.querySelector('.base-slideover__header')).toBeInTheDocument()
			expect(screen.getByText('Кастомная шапка')).toBeInTheDocument()
			expect(document.querySelector('.base-slideover__title')).not.toBeInTheDocument()
		})
	})

	describe('пропс side', () => {
		it('должен применять модификатор --right по умолчанию', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--right')).toBe(true)
		})

		it('должен применять модификатор --left когда side=left', () => {
			render(BaseSlideover, { props: { isOpen: true, side: 'left' } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--left')).toBe(true)
		})
	})

	describe('пропс width', () => {
		it('не должен устанавливать --slideover-width-scale при width=100 (значение по умолчанию)', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			const el = document.querySelector('.base-slideover') as HTMLElement
			expect(el.style.getPropertyValue('--slideover-width-scale')).toBe('')
		})

		it('должен устанавливать --slideover-width-scale=1.5 при width=150', () => {
			render(BaseSlideover, { props: { isOpen: true, width: 150 } })

			const el = document.querySelector('.base-slideover') as HTMLElement
			expect(el.style.getPropertyValue('--slideover-width-scale')).toBe('1.5')
		})

		it('должен устанавливать --slideover-width-scale=0.75 при width=75', () => {
			render(BaseSlideover, { props: { isOpen: true, width: 75 } })

			const el = document.querySelector('.base-slideover') as HTMLElement
			expect(el.style.getPropertyValue('--slideover-width-scale')).toBe('0.75')
		})

		it('не должен устанавливать --slideover-width-scale при isFullWidth=true', () => {
			render(BaseSlideover, { props: { isOpen: true, width: 150, isFullWidth: true } })

			const el = document.querySelector('.base-slideover') as HTMLElement
			expect(el.style.getPropertyValue('--slideover-width-scale')).toBe('')
		})
	})

	describe('пропс isFullWidth', () => {
		it('должен применять модификатор --full когда isFullWidth=true', () => {
			render(BaseSlideover, { props: { isOpen: true, isFullWidth: true } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--full')).toBe(true)
			expect(document.querySelector('.base-slideover__panel')?.classList.contains('base-slideover__panel--full')).toBe(
				true,
			)
		})

		it('не должен применять модификатор --full когда isFullWidth=false', () => {
			render(BaseSlideover, { props: { isOpen: true, isFullWidth: false } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--full')).toBe(false)
			expect(document.querySelector('.base-slideover__panel')?.classList.contains('base-slideover__panel--full')).toBe(
				false,
			)
		})
	})

	describe('пропс isContained', () => {
		it('не должен применять модификатор --contained когда isContained=false', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--contained')).toBe(false)
		})

		it('должен применять модификатор --contained когда isContained=true', () => {
			render(BaseSlideover, { props: { isOpen: true, isContained: true } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--contained')).toBe(true)
		})

		it('должен рендерить на месте когда isContained=true (teleport отключён)', () => {
			const { container } = render(BaseSlideover, { props: { isOpen: true, isContained: true } })

			expect(container.querySelector('.base-slideover')).toBeInTheDocument()
			expect(container.querySelector('.base-slideover--contained')).toBeInTheDocument()
		})

		it('должен телепортировать в body когда isContained=false', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			expect(document.body.querySelector('.base-slideover')).toBeInTheDocument()
		})
	})

	describe('пропс padding', () => {
		it('должен задавать горизонтальные отступы 24px при padding=24 (по умолчанию)', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			const panel = document.querySelector('.base-slideover__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--slideover-pad-left')).toBe('24px')
			expect(panel.style.getPropertyValue('--slideover-pad-right')).toBe('24px')
		})

		it('должен задавать только горизонталь для числового значения', () => {
			render(BaseSlideover, { props: { isOpen: true, padding: 32 } })

			const panel = document.querySelector('.base-slideover__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--slideover-pad-left')).toBe('32px')
			expect(panel.style.getPropertyValue('--slideover-pad-right')).toBe('32px')
			expect(panel.style.getPropertyValue('--slideover-pad-top')).toBe('')
			expect(panel.style.getPropertyValue('--slideover-pad-bottom')).toBe('')
		})

		it('должен задавать горизонталь 0px при padding=0', () => {
			render(BaseSlideover, { props: { isOpen: true, padding: 0 } })

			const panel = document.querySelector('.base-slideover__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--slideover-pad-left')).toBe('0px')
			expect(panel.style.getPropertyValue('--slideover-pad-right')).toBe('0px')
		})

		it('должен задавать вертикаль при объектном значении с top/bottom', () => {
			render(BaseSlideover, { props: { isOpen: true, padding: { x: 20, top: 8, bottom: 12 } } })

			const panel = document.querySelector('.base-slideover__panel') as HTMLElement
			expect(panel.style.getPropertyValue('--slideover-pad-left')).toBe('20px')
			expect(panel.style.getPropertyValue('--slideover-pad-top')).toBe('8px')
			expect(panel.style.getPropertyValue('--slideover-pad-bottom')).toBe('12px')
		})
	})

	describe('пропс container', () => {
		it('должен применять модификатор --contained когда передан container', () => {
			const host = document.createElement('div')
			document.body.appendChild(host)

			render(BaseSlideover, { props: { isOpen: true, container: host } })

			expect(host.querySelector('.base-slideover')?.classList.contains('base-slideover--contained')).toBe(true)

			host.remove()
		})

		it('должен использовать переданный container как цель teleport', () => {
			const host = document.createElement('div')
			host.id = 'slideover-host'
			document.body.appendChild(host)

			render(BaseSlideover, { props: { isOpen: true, container: host } })

			expect(host.querySelector('.base-slideover')).toBeInTheDocument()

			host.remove()
		})
	})

	describe('пропс hasOverlay', () => {
		it('не должен применять модификатор --no-overlay когда hasOverlay=true', () => {
			render(BaseSlideover, { props: { isOpen: true, hasOverlay: true } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--no-overlay')).toBe(false)
		})

		it('должен применять модификатор --no-overlay когда hasOverlay=false', () => {
			render(BaseSlideover, { props: { isOpen: true, hasOverlay: false } })

			expect(document.querySelector('.base-slideover')?.classList.contains('base-slideover--no-overlay')).toBe(true)
		})
	})

	describe('слот footer', () => {
		it('должен рендерить footer когда передан слот', () => {
			render(BaseSlideover, {
				props: { isOpen: true },
				slots: { footer: '<button>Действие</button>' },
			})

			expect(document.querySelector('.base-slideover__footer')).toBeInTheDocument()
		})

		it('не должен рендерить footer когда слот не передан', () => {
			render(BaseSlideover, { props: { isOpen: true } })

			expect(document.querySelector('.base-slideover__footer')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		const STUBS = {
			BaseText: {
				template: '<span :class="customClass"><slot /></span>',
				props: ['customClass'],
			},
		}

		it('должен добавлять строку класса к корневому элементу', () => {
			render(BaseSlideover, {
				props: { isOpen: true, customClass: 'custom-slideover-class' },
			})

			expect(document.querySelector('.base-slideover')?.classList.contains('custom-slideover-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			render(BaseSlideover, {
				props: {
					isOpen: true,
					title: 'Заголовок',
					customClass: {
						root: 'custom-slideover-root',
						panel: 'custom-slideover-panel',
						header: 'custom-slideover-header',
						title: 'custom-slideover-title',
						body: 'custom-slideover-body',
						footer: 'custom-slideover-footer',
					},
				},
				slots: {
					footer: '<p>Подвал</p>',
				},
				global: {
					stubs: STUBS,
				},
			})

			expect(document.querySelector('.base-slideover')?.classList.contains('custom-slideover-root')).toBe(true)
			expect(document.querySelector('.base-slideover__panel')?.classList.contains('custom-slideover-panel')).toBe(true)
			expect(document.querySelector('.base-slideover__header')?.classList.contains('custom-slideover-header')).toBe(
				true,
			)
			expect(document.querySelector('.base-slideover__title')?.classList.contains('custom-slideover-title')).toBe(true)
			expect(document.querySelector('.base-slideover__body')?.classList.contains('custom-slideover-body')).toBe(true)
			expect(document.querySelector('.base-slideover__footer')?.classList.contains('custom-slideover-footer')).toBe(
				true,
			)
		})
	})
})
