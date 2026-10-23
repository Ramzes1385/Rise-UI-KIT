import type { Component } from 'vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { FLOW_3D } from '../helpers/flowMap3d.test-utils'

const BROWSER_GLOBALS = [
	'window',
	'document',
	'navigator',
	'DOMParser',
	'MutationObserver',
	'ResizeObserver',
	'IntersectionObserver',
	'requestAnimationFrame',
	'cancelAnimationFrame',
	'matchMedia',
]

let BaseFlowMap3D: Component

async function serverSide(): Promise<void> {
	BROWSER_GLOBALS.forEach(name => vi.stubGlobal(name, undefined))
	vi.resetModules()
	BaseFlowMap3D = (await import('../../ui/BaseFlowMap3D.vue')).default
}

const app = (props: Record<string, unknown> = {}) => createSSRApp({ render: () => h(BaseFlowMap3D, { data: FLOW_3D, ...props }) })

describe('BaseFlowMap3D SSR', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('рендерится без window и document: область, скрытый список и бирки, без холста и three', async () => {
		await serverSide()
		const rendererFactory = vi.fn()
		const html = await renderToString(app({ rendererFactory }))
		expect(html).toContain('base-flow-map-3d__viewport')
		expect(html).toContain('aria-roledescription="3D-карта связей"')
		expect(html).toContain('base-flow-map-3d__list')
		expect(html).toContain('Шлюз API')
		expect(html).not.toContain('<canvas')
		expect(rendererFactory).not.toHaveBeenCalled()
	})

	it('view="2d" на сервере не рисует область 3D', async () => {
		await serverSide()
		const html = await renderToString(app({ view: '2d' }))
		expect(html).not.toContain('base-flow-map-3d__viewport')
		expect(html).toContain('base-flow-map-3d__pane')
	})

	it('гидратация проходит без расхождений и предупреждений', async () => {
		await serverSide()
		const html = await renderToString(app())
		vi.unstubAllGlobals()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const container = document.createElement('div')
		container.innerHTML = html
		document.body.append(container)
		const { createSSRApp: createClientApp } = await import('vue')
		const client = createClientApp({
			render: () =>
				h(BaseFlowMap3D, {
					data: FLOW_3D,
					rendererFactory: () => {
						throw new Error('no gl')
					},
				}),
		})
		client.mount(container)
		expect(warn).not.toHaveBeenCalled()
		expect(error).not.toHaveBeenCalled()
		client.unmount()
		container.remove()
	})
})
