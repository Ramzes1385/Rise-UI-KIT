import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../types/BaseBreadcrumbs.types'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', href: 'https://example.com/' },
	{ label: 'Каталог', href: 'https://example.com/catalog' },
	{ label: 'Ворота' },
]

function readJsonLd(html: string): unknown {
	const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
	return match ? JSON.parse(match[1]) : null
}

describe('BaseBreadcrumbs SSR', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('seo — JSON-LD BreadcrumbList в HTML сервера без window и document', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)

		const html = await renderToString(createSSRApp({ render: () => h(BaseBreadcrumbs, { items: ITEMS, seo: true }) }))

		expect(readJsonLd(html)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://example.com/' },
				{ '@type': 'ListItem', position: 2, name: 'Каталог', item: 'https://example.com/catalog' },
				{ '@type': 'ListItem', position: 3, name: 'Ворота' },
			],
		})
	})

	it('без seo JSON-LD в HTML сервера нет', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)

		const html = await renderToString(createSSRApp({ render: () => h(BaseBreadcrumbs, { items: ITEMS }) }))

		expect(html).toContain('Каталог')
		expect(readJsonLd(html)).toBeNull()
	})
})
