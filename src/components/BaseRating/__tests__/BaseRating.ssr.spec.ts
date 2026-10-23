import { createSSRApp, h } from 'vue'
import BaseRating from '../ui/BaseRating.vue'
import { renderToString } from 'vue/server-renderer'

const PRODUCT = { itemReviewed: { '@type': 'Product', name: 'Ноутбук Rise 13' }, ratingCount: 128 }

function readJsonLd(html: string): unknown {
	const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
	return match ? JSON.parse(match[1]) : null
}

describe('BaseRating SSR', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('seo с data — JSON-LD AggregateRating в HTML сервера без window и document', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)

		const html = await renderToString(
			createSSRApp({ render: () => h(BaseRating, { modelValue: 4.5, step: 0.5, isReadonly: true, seo: { data: PRODUCT } }) }),
		)

		expect(readJsonLd(html)).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'AggregateRating',
			ratingValue: 4.5,
			bestRating: 5,
			ratingCount: 128,
			itemReviewed: { '@type': 'Product', name: 'Ноутбук Rise 13' },
		})
	})
})
