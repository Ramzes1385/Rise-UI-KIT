import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import BaseImageMap3D from '../../ui/BaseImageMap3D.vue'
import { createFakeRenderer, DATA_3D, mockWebGL } from '../imageMap3d.test-utils'

const app = (props: Record<string, unknown> = {}) => createSSRApp({ render: () => h(BaseImageMap3D, { data: DATA_3D, ...props }) })

describe('BaseImageMap3D SSR', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('рендерится без window и document: область карты и список объектов, без холста', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		const html = await renderToString(app())
		expect(html).toContain('base-image-map-3d__viewport')
		expect(html).toContain('aria-roledescription="3D-карта"')
		expect(html).toContain('Список объектов, Этаж 1')
		expect(html).toContain('Магазин')
		expect(html).not.toContain('<canvas')
	})

	it('view="2d" на сервере — обычная BaseImageMap', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		const html = await renderToString(app({ view: '2d', has2dToggle: true }))
		expect(html).toContain('base-image-map')
		expect(html).not.toContain('base-image-map-3d__viewport')
	})

	it('гидратация без расхождений; холст появляется только после монтирования', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		const html = await renderToString(app())
		vi.unstubAllGlobals()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const container = document.createElement('div')
		container.innerHTML = html
		document.body.append(container)
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe = vi.fn()
				disconnect = vi.fn()
			},
		)
		mockWebGL(true)
		expect(container.querySelector('canvas')).toBeNull()
		const client = app({ rendererFactory: () => createFakeRenderer() })
		client.mount(container)
		await nextTick()
		expect(warn.mock.calls.flat().join(' ')).not.toMatch(/[Hh]ydration/)
		expect(error.mock.calls.flat().join(' ')).not.toMatch(/[Hh]ydration/)
		expect(container.querySelector('.base-image-map-3d__objects')).not.toBeNull()
		expect(container.querySelector('canvas')).not.toBeNull()
		client.unmount()
		container.remove()
	})
})
