/**
 * Unit-тесты для BaseImage.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'

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
		it('должен применять border-radius с calc по умолчанию', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain(
				'border-radius: calc(12px * var(--size-scale, 1))',
			)
		})

		it('должен применять border-radius: 0 когда borderRadius=0', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', borderRadius: 0 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain('border-radius: 0')
		})

		it('должен применять border-radius с calc когда borderRadius=24', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', borderRadius: 24 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain(
				'border-radius: calc(24px * var(--size-scale, 1))',
			)
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

		it('должен вернуть плейсхолдер после сброса hasPlaceholder=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasPlaceholder: false },
			})

			expect(wrapper.find('.base-image__placeholder').exists()).toBe(false)

			await wrapper.setProps({ hasPlaceholder: undefined })

			expect(wrapper.find('.base-image__placeholder').exists()).toBe(true)
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
		it('не должен устанавливать --size-scale как CSS-переменную когда sizeScale=100', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', sizeScale: 100 },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).not.toContain('--size-scale:')
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

	describe('пропс hasZoom', () => {
		it('должен применять класс --zoomable когда hasZoom=true', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasZoom: true },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(true)
		})

		it('не должен применять класс --zoomable по умолчанию', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(false)
		})
	})

	describe('пропс convertToWebp', () => {
		it('должен генерировать webp source когда convertToWebp=true', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', convertToWebp: true },
			})

			const webpSource = container.querySelector('source[type="image/webp"]')
			expect(webpSource).toBeInTheDocument()
		})

		it('не должен генерировать webp source для внешних изображений когда convertToWebp=false', () => {
			const { container } = render(BaseImage, {
				props: { src: 'https://cdn.example.com/img.png', alt: 'Тест', convertToWebp: false },
			})

			const webpSource = container.querySelector('source[type="image/webp"]')
			expect(webpSource).not.toBeInTheDocument()
		})

		it('должен генерировать webp source для внешних изображений когда convertToWebp=true', () => {
			const { container } = render(BaseImage, {
				props: { src: 'https://cdn.example.com/img.png', alt: 'Тест', convertToWebp: true },
			})

			const webpSource = container.querySelector('source[type="image/webp"]')
			expect(webpSource).toBeInTheDocument()
		})

		it('должен генерировать avif source для локальных изображений', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const avifSource = container.querySelector('source[type="image/avif"]')
			expect(avifSource).toBeInTheDocument()
		})

		it('не должен генерировать avif source для внешних изображений', () => {
			const { container } = render(BaseImage, {
				props: { src: 'https://cdn.example.com/img.png', alt: 'Тест' },
			})

			const avifSource = container.querySelector('source[type="image/avif"]')
			expect(avifSource).not.toBeInTheDocument()
		})
	})

	describe('пропс gallery', () => {
		it('не должен рендерить элементы галереи без hasZoom', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', gallery: ['img1.jpg', 'img2.jpg'] },
			})

			expect(container.querySelector('.base-image__zoom-gallery')).not.toBeInTheDocument()
		})
	})

	describe('события', () => {
		it('должен эмитить load при загрузке изображения', async () => {
			const { emitted, container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const img = container.querySelector('img')
			await fireEvent.load(img!)

			expect(emitted()).toHaveProperty('load')
		})

		it('должен эмитить error при ошибке загрузки', async () => {
			const { emitted, container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const img = container.querySelector('img')
			await fireEvent.error(img!)

			expect(emitted()).toHaveProperty('error')
		})

		it('должен рендерить блок ошибки при ошибке загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const img = container.querySelector('img')
			await fireEvent.error(img!)

			expect(container.querySelector('.base-image__error')).toBeInTheDocument()
		})

		it('должен добавлять класс --loaded после загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
			})

			const img = container.querySelector('img')
			await fireEvent.load(img!)

			expect(container.querySelector('.base-image')?.classList.contains('base-image--loaded')).toBe(true)
		})
	})

	describe('пропс aspectRatio', () => {
		it('должен устанавливать aspect-ratio когда передан', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', aspectRatio: '16/9' },
			})

			expect(container.querySelector('.base-image')?.getAttribute('style')).toContain('aspect-ratio: 16/9')
		})
	})

	describe('слот placeholder', () => {
		it('должен рендерить кастомный контент слота placeholder', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasPlaceholder: true },
				slots: { placeholder: '<div class="custom-placeholder">Загрузка...</div>' },
			})

			expect(container.querySelector('.custom-placeholder')).toBeInTheDocument()
			expect(container.querySelector('.custom-placeholder')).toHaveTextContent('Загрузка...')
		})

		it('не должен рендерить shimmer когда передан кастомный placeholder', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasPlaceholder: true },
				slots: { placeholder: '<div class="custom-placeholder">Загрузка...</div>' },
			})

			expect(container.querySelector('.base-image__shimmer')).not.toBeInTheDocument()
		})
	})

	describe('слот error', () => {
		it('должен рендерить кастомный контент слота error', async () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
				slots: { error: '<div class="custom-error">Не удалось загрузить</div>' },
			})

			const img = container.querySelector('img')
			await fireEvent.error(img!)

			expect(container.querySelector('.custom-error')).toBeInTheDocument()
			expect(container.querySelector('.custom-error')).toHaveTextContent('Не удалось загрузить')
		})

		it('не должен рендерить стандартную ошибку когда передан кастомный слот error', async () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест' },
				slots: { error: '<div class="custom-error">Не удалось загрузить</div>' },
			})

			const img = container.querySelector('img')
			await fireEvent.error(img!)

			expect(container.querySelector('.base-image__error-icon')).not.toBeInTheDocument()
		})
	})

	describe('emit zoom', () => {
		it('должен эмитить zoom при изменении масштаба', async () => {
			const { emitted, container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', hasZoom: true },
			})

			const img = container.querySelector('img')
			await fireEvent.click(img!)

			await fireEvent.click(document.querySelector('.base-image__zoom-btn')!)

			expect(emitted()).toHaveProperty('zoom')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseImage, {
				props: { src: 'test.jpg', alt: 'Тест', customClass: 'my-custom-image-class' },
			})

			expect(container.querySelector('.base-image')?.classList.contains('my-custom-image-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseImage, {
				props: {
					src: 'test.jpg',
					alt: 'Тест',
					customClass: {
						root: 'my-image-root',
						placeholder: 'my-image-placeholder',
						img: 'my-image-img',
					},
					hasPlaceholder: true,
				},
			})

			const root = container.querySelector('.base-image')
			const placeholder = container.querySelector('.base-image__placeholder')
			const img = container.querySelector('.base-image__img')

			expect(root?.classList.contains('my-image-root')).toBe(true)
			expect(placeholder?.classList.contains('my-image-placeholder')).toBe(true)
			expect(img?.classList.contains('my-image-img')).toBe(true)
		})
	})
})
