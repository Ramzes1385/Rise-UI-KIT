import '@testing-library/jest-dom/vitest'
import BaseFooter from '../ui/BaseFooter.vue'
import { render } from '@testing-library/vue'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

const ORGANIZATION = { name: 'Rise', url: 'https://example.com', logo: 'https://example.com/logo.png', sameAs: ['https://t.me/rise'] }

describe('BaseFooter SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseFooter)
		expect(jsonLd(container)).toBeNull()
	})

	it('seo с data — Organization с полями сайта', () => {
		const { container } = render(BaseFooter, { props: { seo: { data: ORGANIZATION } } })
		expect(readJsonLd(container)).toEqual({ '@context': 'https://schema.org', '@type': 'Organization', ...ORGANIZATION })
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('@type можно заменить на подтип', () => {
		const { container } = render(BaseFooter, { props: { seo: { data: { '@type': 'LocalBusiness', name: 'Rise' } } } })
		expect(readJsonLd(container)['@type']).toBe('LocalBusiness')
	})

	it('seo без названия — предупреждение', () => {
		render(BaseFooter, { props: { seo: true } })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Organization'))
	})
})
