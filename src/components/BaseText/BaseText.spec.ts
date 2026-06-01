/**
 * Unit-тесты для BaseText.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseText from './BaseText.vue'

describe('BaseText unit', () => {
	describe('рендер', () => {
		it('должен рендерить текст', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Привет' },
			})

			expect(container.querySelector('.base-text')).toBeInTheDocument()
			expect(screen.getByText('Привет')).toBeInTheDocument()
		})

		it('должен рендерить тег p по умолчанию', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('p.base-text')).toBeInTheDocument()
		})
	})

	describe('пропс tag', () => {
		it('должен рендерить тег h1 когда tag=h1', () => {
			const { container } = render(BaseText, {
				props: { tag: 'h1' },
				slots: { default: 'Заголовок' },
			})

			expect(container.querySelector('h1.base-text')).toBeInTheDocument()
		})

		it('должен рендерить тег span когда tag=span', () => {
			const { container } = render(BaseText, {
				props: { tag: 'span' },
				slots: { default: 'Спан' },
			})

			expect(container.querySelector('span.base-text')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseText, {
				props: { sizeScale: 100 },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.getAttribute('style')).not.toContain('--size-scale')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseText, {
				props: { sizeScale: 150 },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс weight', () => {
		it('должен устанавливать font-weight: 400 по умолчанию', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.getAttribute('style')).toContain('font-weight: 400')
		})

		it('должен устанавливать font-weight: 700 когда weight=700', () => {
			const { container } = render(BaseText, {
				props: { weight: 700 },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.getAttribute('style')).toContain('font-weight: 700')
		})
	})

	describe('пропс nowrap', () => {
		it('должен добавлять класс --nowrap когда nowrap=true', () => {
			const { container } = render(BaseText, {
				props: { nowrap: true },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--nowrap')).toBe(true)
		})

		it('не должен добавлять класс --nowrap по умолчанию', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--nowrap')).toBe(false)
		})
	})

	describe('пропс truncate', () => {
		it('должен добавлять класс --truncate когда truncate=true и maxLines=1', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, maxLines: 1 },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--truncate')).toBe(true)
		})

		it('не должен добавлять класс --truncate по умолчанию', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--truncate')).toBe(false)
		})
	})

	describe('пропс maxLines', () => {
		it('должен устанавливать -webkit-line-clamp когда truncate=true и maxLines>1', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, maxLines: 3 },
				slots: { default: 'Текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style')
			expect(style).toContain('-webkit-line-clamp: 3')
		})

		it('не должен устанавливать -webkit-line-clamp когда truncate=false', () => {
			const { container } = render(BaseText, {
				props: { truncate: false, maxLines: 3 },
				slots: { default: 'Текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style')
			expect(style).not.toContain('-webkit-line-clamp')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseText, {
				props: { customClass: 'my-custom-text-class' },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('my-custom-text-class')).toBe(true)
		})

		it('должен добавлять объект класса к корневому элементу', () => {
			const { container } = render(BaseText, {
				props: { customClass: { root: 'my-custom-text-root' } },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('my-custom-text-root')).toBe(true)
		})
	})
})
