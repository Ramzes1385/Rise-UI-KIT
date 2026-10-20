import { mapData } from './flowUi'
import { createSSRApp, h } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'

const PALETTE = '.base-flow-map__edit-palette'
const INSPECTOR = '.base-flow-map__edit-inspector'
const LOAD_TIMEOUT = 15000

async function hydrate(props: Partial<BaseFlowMapProps>) {
	const host = document.createElement('div')
	host.innerHTML = await renderToString(createSSRApp({ render: () => h(BaseFlowMap, { data: mapData(), ...props }) }))
	document.body.append(host)
	const app = createSSRApp({ render: () => h(BaseFlowMap, { data: mapData(), ...props }) })
	app.mount(host)
	await flushPromises()
	return { host, app }
}

describe('гидрация карты поверх серверной разметки', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('на сервере режим «Правка» не рисуется: разметка совпадает с просмотром', async () => {
		const html = await renderToString(
			createSSRApp({ render: () => h(BaseFlowMap, { data: mapData(), mode: 'edit', modes: ['view', 'edit'] }) }),
		)
		expect(html).not.toContain('base-flow-map__edit-palette')
	})

	it.each([
		['панели по умолчанию', {}],
		['panels: []', { panels: [] }],
	])('mode: edit с порога показывает палитру и инспектор после загрузки (%s)', async (_name, extra) => {
		const { host, app } = await hydrate({ mode: 'edit', modes: ['view', 'edit'], ...extra })
		await vi.waitFor(() => expect(host.querySelector(PALETTE)).not.toBeNull(), { timeout: LOAD_TIMEOUT })
		await vi.waitFor(() => expect(host.querySelector(INSPECTOR)).not.toBeNull(), { timeout: LOAD_TIMEOUT })
		app.unmount()
	})
})
