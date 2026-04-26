/**
 * Unit-тесты для BaseImage.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseImage from './BaseImage.vue'

describe('BaseImage unit', () => {
	describe('рендер', () => {
		it('должен рендерить изображение', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('.base-image')).toBeInTheDocument()
		})

		it('должен рендерить img с правильным src', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const img = container.querySelector('img')
			expect(img).toBeInTheDocument()
			expect(img?.getAttribute('src')).toBe('test.jpg')
		})

		it('должен рендерить img с правильным alt', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Описание' },
			})

			const img = container.querySelector('img')
			expect(img?.getAttribute('alt')).toBe('Описание')
		})
	})

	describe('пропс fit', () => {
		it('должен применять модификатор --cover по умолчанию', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--cover')).toBe(true)
		})

		it('должен применять модификатор --contain когда fit=contain', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', fit: 'contain' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--contain')).toBe(true)
		})
	})

	describe('пропс borderRadius', () => {
		it('должен применять модификатор --radius-md по умолчанию', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--radius-md')).toBe(true)
		})

		it('должен применять модификатор --radius-full когда borderRadius=full', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', borderRadius: 'full' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--radius-full')).toBe(true)
		})
	})

	describe('плейсхолдер', () => {
		it('должен рендерить плейсхолдер когда hasPlaceholder=true и не загружено', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasPlaceholder: true },
			})

			expect(container.querySelector('.base-image__placeholder')).toBeInTheDocument()
		})

		it('не должен рендерить плейсхолдер когда hasPlaceholder=false', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasPlaceholder: false },
			})

			expect(container.querySelector('.base-image__placeholder')).not.toBeInTheDocument()
		})
	})

	describe('пропс loading', () => {
		it('должен устанавливать loading=lazy по умолчанию', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('img')?.getAttribute('loading')).toBe('lazy')
		})

		it('должен устанавливать loading=eager когда loading=eager', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', loading: 'eager' },
			})

			expect(container.querySelector('img')?.getAttribute('loading')).toBe('eager')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', sizeScale: 100 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', sizeScale: 150 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=0.75', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', sizeScale: 75 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})
})
