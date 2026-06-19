/**
 * Integration-тесты для BaseImage.
 * Проверяют взаимодействие с useImageZoom, gallery и overlay.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseImage from '../ui/BaseImage.vue'

describe('BaseImage integration', () => {
	const defaultProps = {
		src: 'test.jpg',
		alt: 'Тест',
	}

	describe('hasZoom', () => {
		it('должен применять класс --zoomable когда zoomConfig.hasZoom=true', () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true } },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(true)
		})

		it('не должен применять класс --zoomable когда zoomConfig.hasZoom=false', () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: false } },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(false)
		})

		it('должен открывать зум при клике на изображение когда zoomConfig.hasZoom=true', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoom = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoom).toBeInTheDocument()
		})

		it('не должен открывать зум при клике когда zoomConfig.hasZoom=false', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: false } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoom = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoom).not.toBeInTheDocument()
		})
	})

	describe('закрытие зума', () => {
		it('должен закрывать зум по клику на оверлей когда zoomConfig.closeOnOverlay=true', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true, closeOnOverlay: true } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoomOverlay = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoomOverlay).toBeInTheDocument()

			await fireEvent.click(zoomOverlay!)

			expect(container.ownerDocument.querySelector('.base-image__zoom')).not.toBeInTheDocument()
		})

		it('не должен закрывать зум по клику на оверлей когда zoomConfig.closeOnOverlay=false', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true, closeOnOverlay: false } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoomOverlay = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoomOverlay).toBeInTheDocument()

			await fireEvent.click(zoomOverlay!)

			expect(container.ownerDocument.querySelector('.base-image__zoom')).toBeInTheDocument()
		})
	})

	describe('gallery', () => {
		it('должен рендерить навигацию галереи когда передан gallery', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const gallery = container.ownerDocument.querySelector('.base-image__zoom-gallery')
			expect(gallery).toBeInTheDocument()
		})

		it('должен рендерить миниатюры галереи', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const thumbs = container.ownerDocument.querySelectorAll('.base-image__zoom-thumb')
			expect(thumbs).toHaveLength(2)
		})

		it('должен рендерить навигацию вперёд когда есть следующее изображение', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const nextBtn = container.ownerDocument.querySelector('.base-image__zoom-nav--next')
			expect(nextBtn).toBeInTheDocument()
		})

		it('не должен рендерить навигацию назад на первом изображении', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const prevBtn = container.ownerDocument.querySelector('.base-image__zoom-nav--prev')
			expect(prevBtn).not.toBeInTheDocument()
		})
	})

	describe('ошибка загрузки', () => {
		it('должен рендерить блок ошибки при ошибке загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.error(img!)

			expect(container.querySelector('.base-image__error')).toBeInTheDocument()
		})
	})

	describe('успешная загрузка', () => {
		it('должен применять класс --loaded после загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.load(img!)

			expect(container.querySelector('.base-image')?.classList.contains('base-image--loaded')).toBe(true)
		})
	})
})
