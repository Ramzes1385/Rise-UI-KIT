import '@testing-library/jest-dom/vitest'
import BaseImage from '../ui/BaseImage.vue'
import { render } from '@testing-library/vue'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

describe('BaseImage SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseImage, { props: { src: '/photo.jpg', alt: 'Закат' } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo — ImageObject: contentUrl, подпись из alt и автор из data', () => {
		const { container } = render(BaseImage, {
			props: {
				src: '/photo.jpg',
				alt: 'Закат над заливом',
				seo: { baseUrl: 'https://example.com', data: { creditText: 'Анна Петрова' } },
			},
		})
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'ImageObject',
			contentUrl: 'https://example.com/photo.jpg',
			caption: 'Закат над заливом',
			creditText: 'Анна Петрова',
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('без автора, лицензии или копирайта — предупреждение', () => {
		const { container } = render(BaseImage, { props: { src: '/photo.jpg', alt: '', seo: true } })
		expect(readJsonLd(container)).not.toHaveProperty('caption')
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('creator|creditText|copyrightNotice|license'))
	})
})
