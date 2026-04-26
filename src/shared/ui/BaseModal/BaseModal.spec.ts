/**
 * Unit-тесты для BaseModal.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseModal from './BaseModal.vue'

describe('BaseModal unit', () => {
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

	describe('пропс size', () => {
		it('должен применять модификатор --md по умолчанию', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal__content')?.classList.contains('base-modal__content--md')).toBe(true)
		})

		it('должен применять модификатор --sm когда size=sm', () => {
			render(BaseModal, { props: { isOpen: true, size: 'sm' } })

			expect(document.querySelector('.base-modal__content')?.classList.contains('base-modal__content--sm')).toBe(true)
		})

		it('должен применять модификатор --lg когда size=lg', () => {
			render(BaseModal, { props: { isOpen: true, size: 'lg' } })

			expect(document.querySelector('.base-modal__content')?.classList.contains('base-modal__content--lg')).toBe(true)
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --default по умолчанию', () => {
			render(BaseModal, { props: { isOpen: true } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--default')).toBe(true)
		})

		it('должен применять модификатор --confirm когда variant=confirm', () => {
			render(BaseModal, { props: { isOpen: true, variant: 'confirm', title: 'Подтверждение' } })

			expect(document.querySelector('.base-modal')?.classList.contains('base-modal--confirm')).toBe(true)
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
})
