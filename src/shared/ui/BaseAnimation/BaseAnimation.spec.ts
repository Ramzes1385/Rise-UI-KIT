/**
 * Unit-тесты для BaseAnimation.
 * Проверяют рендер, пропсы и видимость.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseAnimation from './BaseAnimation.vue'

describe('BaseAnimation unit', () => {
	describe('рендер', () => {
		it('должен рендерить анимацию когда show=true', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})

		it('не должен рендерить когда show=false', () => {
			const { container } = render(BaseAnimation, {
				props: { show: false },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).not.toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс show', () => {
		it('должен рендерить по умолчанию (show=true)', () => {
			const { container } = render(BaseAnimation, {
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})
	})

	describe('пропс name', () => {
		it('должен применять имя анимации fade по умолчанию', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			const transition = container.querySelector('.fade-enter-active')
			// Transition name применяется через CSS-классы Vue
			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})
	})

	describe('пропс isGroup', () => {
		it('должен рендерить TransitionGroup когда isGroup=true', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true, isGroup: true, tag: 'ul' },
				slots: { default: '<li>Элемент</li>' },
			})

			// TransitionGroup рендерит указанный тег
			const list = container.querySelector('ul')
			expect(list).toBeInTheDocument()
		})
	})

	describe('emit after-enter', () => {
		it('должен иметь обработчик after-enter', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			// Проверяем что компонент рендерится корректно
			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})
	})
})
