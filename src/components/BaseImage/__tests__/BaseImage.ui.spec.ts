import '@testing-library/jest-dom/vitest'
import BaseImage from '../ui/BaseImage.vue'
import { createUiKitPlugin } from '@/plugin'
import { IMAGE_PARTS } from '../types/BaseImage.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const GALLERY = ['img1.jpg', 'img2.jpg', 'img3.jpg']
const ZOOM_PARTS = IMAGE_PARTS.filter(part => part.startsWith('zoom') || part.startsWith('minimap'))

function allParts(): Record<string, string> {
	return Object.fromEntries([['root', 'u-root'], ...IMAGE_PARTS.map(part => [part, `u-${part}`])])
}

async function openZoomWithMinimap(container: Element): Promise<void> {
	await fireEvent.click(container.querySelector('.base-image__img')!)
	await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
}

describe('BaseImage: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('без ui — только классы кита; плейсхолдер и мерцание', () => {
		const { container } = render(BaseImage, { props: { src: 'img1.jpg', alt: 'Тест' } })
		const root = container.querySelector('.base-image')!

		expect(root.className).toMatch(/^base-image /)
		expect(root.querySelector('.base-image__placeholder')).toHaveAttribute('class', 'base-image__placeholder')
		expect(root.querySelector('.base-image__shimmer')).toHaveAttribute('class', 'base-image__shimmer')
		expect(root.querySelector('.base-image__frame')).toHaveAttribute('class', 'base-image__frame')
		expect(root.querySelector('.base-image__img')).toHaveAttribute('class', 'base-image__img')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const { container } = render(BaseImage, {
			props: { src: 'img1.jpg', alt: 'Тест', customClass: { root: 'own-root', img: 'own-img' }, ui: allParts() },
		})
		const root = container.querySelector('.base-image')!

		expect(root).toHaveClass('base-image', 'u-root', 'base-image--cover', 'own-root')
		for (const part of ['placeholder', 'shimmer', 'frame', 'img']) {
			expect(root.querySelector(`.base-image__${part}`)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-image__img')).toHaveClass('own-img')
	})

	it('части блока ошибки получают классы', async () => {
		const { container } = render(BaseImage, { props: { src: 'broken.jpg', alt: 'Тест', ui: allParts() } })
		await fireEvent.error(container.querySelector('.base-image__img')!)

		for (const part of ['error', 'error-icon', 'error-text']) {
			expect(container.querySelector(`.base-image__${part}`)).toHaveClass(`u-${part}`)
		}
	})

	it('части окна просмотра получают классы из ui родителя', async () => {
		const { container } = render(BaseImage, {
			props: { src: 'img2.jpg', alt: 'Тест', gallery: GALLERY, zoomConfig: { hasZoom: true }, ui: allParts() },
		})
		await openZoomWithMinimap(container)

		for (const part of ZOOM_PARTS) {
			const element = document.querySelector(`.base-image__${part}`)
			expect(element, part).toHaveClass(`u-${part}`)
		}
		expect(document.querySelector('.base-image__zoom-btn--close')).toHaveClass('u-zoom-btn')
		expect(document.querySelector('.base-image__zoom-nav--prev')).toHaveClass('u-zoom-nav')
		expect(document.querySelector('.base-image__zoom-nav--next')).toHaveClass('u-zoom-nav')
		expect(document.querySelector('.base-image__zoom-thumb--active')).toHaveClass('u-zoom-thumb')
	})

	it('классы из defaults.BaseImage.ui плагина склеиваются с классами экземпляра', async () => {
		const { container } = render(BaseImage, {
			props: { src: 'img1.jpg', alt: 'Тест', zoomConfig: { hasZoom: true }, ui: { img: 'own-img', zoom: 'own-zoom' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseImage: { ui: { root: 'app-root', img: 'app-img', zoom: 'app-zoom' } } } })],
			},
		})
		const root = container.querySelector('.base-image')!

		expect(root).toHaveClass('app-root')
		expect(root.querySelector('.base-image__img')).toHaveAttribute('class', 'base-image__img app-img own-img')
		await fireEvent.click(root.querySelector('.base-image__img')!)
		expect(document.querySelector('.base-image__zoom')).toHaveClass('base-image__zoom', 'app-zoom', 'own-zoom')
	})
})
