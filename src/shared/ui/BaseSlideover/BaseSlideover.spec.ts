/**
 * Unit-тесты для BaseSlideover.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSlideover from './BaseSlideover.vue'

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
})
