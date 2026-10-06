import type { Component } from 'vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { ImageMapData } from '../../types/imageMapData.types'

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" x="100" y="100" width="200" height="100"/></svg>'

const DATA: ImageMapData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', image: 'plan-1.png', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', svg: SVG, width: 800, height: 400 },
	],
	objects: [
		{ id: 'shop', type: 'rect', title: 'Магазин', x: 0.1, y: 0.1, width: 0.2, height: 0.2, layer: 'f1' },
		{ id: 'hall', type: 'svg', title: 'Зал', elementId: 'hall', layer: 'f2' },
	],
}

const BROWSER_GLOBALS = [
	'window',
	'document',
	'navigator',
	'DOMParser',
	'MutationObserver',
	'ResizeObserver',
	'requestAnimationFrame',
	'cancelAnimationFrame',
	'matchMedia',
]

let BaseImageMap: Component

async function serverSide(): Promise<void> {
	BROWSER_GLOBALS.forEach(name => vi.stubGlobal(name, undefined))
	vi.resetModules()
	BaseImageMap = (await import('../../ui/BaseImageMap.vue')).default
}

const app = (props: Record<string, unknown> = {}) => createSSRApp({ render: () => h(BaseImageMap, { data: DATA, ...props }) })

describe('BaseImageMap SSR', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('рендерится без window, document, navigator, DOMParser, MutationObserver и rAF: растровый слой, фигуры и переключатель этажей', async () => {
		await serverSide()
		const html = await renderToString(app())
		expect(html).toContain('base-image-map')
		expect(html).toContain('plan-1.png')
		expect(html).toContain('Магазин')
		expect(html).toContain('Этаж 2')
	})

	it('слой с SVG рендерится без window, document, navigator, DOMParser, MutationObserver и rAF', async () => {
		await serverSide()
		const html = await renderToString(app({ layer: 'f2' }))
		expect(html).toContain('base-image-map')
	})
})
