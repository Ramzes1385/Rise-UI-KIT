import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../types/BaseBreadcrumbs.types'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Документация', href: 'https://docs.example.com' },
	{ label: 'Ворота' },
]

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

describe('BaseBreadcrumbs SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки и microdata нет', () => {
		const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })
		expect(jsonLd(container)).toBeNull()
		expect(container.querySelector('[itemscope], [itemprop]')).toBeNull()
	})

	it('seo — BreadcrumbList по всем крошкам, у последней нет item', () => {
		const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS, seo: true, maxItems: 2 } })
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Главная', item: '/' },
				{ '@type': 'ListItem', position: 2, name: 'Каталог', item: '/catalog' },
				{ '@type': 'ListItem', position: 3, name: 'Документация', item: 'https://docs.example.com' },
				{ '@type': 'ListItem', position: 4, name: 'Ворота' },
			],
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('baseUrl делает адреса абсолютными, data дополняет разметку', () => {
		const { container } = render(BaseBreadcrumbs, {
			props: { items: ITEMS, seo: { baseUrl: 'https://example.com', data: { name: 'Путь к товару' } } },
		})
		const data = readJsonLd(container)
		expect(data.name).toBe('Путь к товару')
		expect(data.itemListElement[1].item).toBe('https://example.com/catalog')
	})

	it('пустой список — разметки нет', () => {
		const { container } = render(BaseBreadcrumbs, { props: { items: [], seo: true } })
		expect(jsonLd(container)).toBeNull()
	})

	it('без обязательного name — предупреждение', () => {
		render(BaseBreadcrumbs, { props: { items: [{ label: '' }], seo: true } })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('itemListElement[].name'))
	})

	it('</script> в названии не закрывает тег', () => {
		const { container } = render(BaseBreadcrumbs, { props: { items: [{ label: '</script><img src=x>' }], seo: true } })
		expect(jsonLd(container)!.innerHTML).not.toContain('</script>')
		expect(readJsonLd(container).itemListElement[0].name).toBe('</script><img src=x>')
		expect(container.querySelector('img')).toBeNull()
	})
})
