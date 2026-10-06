import { createSSRApp, h } from 'vue'
import BaseImageMap from '../../ui/BaseImageMap.vue'
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

const app = (props: Record<string, unknown> = {}) => createSSRApp({ render: () => h(BaseImageMap, { data: DATA, ...props }) })

describe('BaseImageMap SSR', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('рендерится без window и document: растровый слой, фигуры и переключатель этажей', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		const html = await renderToString(app())
		expect(html).toContain('base-image-map')
		expect(html).toContain('plan-1.png')
		expect(html).toContain('Магазин')
		expect(html).toContain('Этаж 2')
	})

	it('слой с SVG рендерится без window и document', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		const html = await renderToString(app({ layer: 'f2' }))
		expect(html).toContain('base-image-map')
	})
})
