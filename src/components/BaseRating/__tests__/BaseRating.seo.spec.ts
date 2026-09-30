import '@testing-library/jest-dom/vitest'
import BaseRating from '../ui/BaseRating.vue'
import { render } from '@testing-library/vue'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

const PRODUCT = { itemReviewed: { '@type': 'Product', name: 'Ноутбук Rise 13' }, ratingCount: 128 }

describe('BaseRating SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseRating, { props: { modelValue: 4 } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo с data — AggregateRating с оценкой, шкалой, товаром и числом оценок', () => {
		const { container } = render(BaseRating, { props: { modelValue: 4.5, step: 0.5, isReadonly: true, seo: { data: PRODUCT } } })
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'AggregateRating',
			ratingValue: 4.5,
			bestRating: 5,
			worstRating: 0.5,
			...PRODUCT,
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('без товара и числа оценок — предупреждение', () => {
		const { container } = render(BaseRating, { props: { modelValue: 4, max: 10, seo: true } })
		expect(readJsonLd(container)).toMatchObject({ ratingValue: 4, bestRating: 10, worstRating: 1 })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ratingCount|reviewCount, itemReviewed.name'))
	})

	it('без оценки разметки нет', () => {
		const { container } = render(BaseRating, { props: { modelValue: 0, seo: true } })
		expect(jsonLd(container)).toBeNull()
	})
})
