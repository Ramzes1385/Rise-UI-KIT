import type { Component } from 'vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DATA_ROADMAP_3D, createFakeRenderer } from '../fixtures/roadmap3d.test-utils'

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

let BaseRoadmap3D: Component

async function serverSide(): Promise<void> {
	BROWSER_GLOBALS.forEach(name => vi.stubGlobal(name, undefined))
	vi.resetModules()
	BaseRoadmap3D = (await import('../../ui/BaseRoadmap3D.vue')).default
}

const app = (props: Record<string, unknown> = {}) => createSSRApp({ render: () => h(BaseRoadmap3D, { data: DATA_ROADMAP_3D, ...props }) })

describe('BaseRoadmap3D: SSR', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('рендерится без window и document: область сцены, скрытый список этапов, подсказка, без холста', async () => {
		await serverSide()
		const factory = vi.fn(() => createFakeRenderer())
		const html = await renderToString(app({ rendererFactory: factory }))
		expect(html).toContain('base-roadmap-3d__viewport')
		expect(html).toContain('aria-roledescription="3D-дорожная карта"')
		expect(html).toContain('base-roadmap-3d__list')
		expect(html).toContain('Основы')
		expect(html).toContain('Каркас')
		expect(html).not.toContain('<canvas')
		expect(factory).not.toHaveBeenCalled()
	})

	it('view=2d на сервере — BaseRoadmap без области сцены', async () => {
		await serverSide()
		const html = await renderToString(app({ view: '2d' }))
		expect(html).not.toContain('base-roadmap-3d__viewport')
		expect(html).toContain('base-roadmap-3d__map')
	})

	it('без warn и error при серверной отрисовке', async () => {
		await serverSide()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		await renderToString(app())
		expect(warn).not.toHaveBeenCalled()
		expect(error).not.toHaveBeenCalled()
	})
})
