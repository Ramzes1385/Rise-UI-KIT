import { mapData } from '../flowUi'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import type { BaseFlowMapProps } from '../../../../types/BaseFlowMap.types'

const html = (props: Partial<BaseFlowMapProps> = {}) =>
	renderToString(createSSRApp({ render: () => h(BaseFlowMap, { data: mapData(), ...props }) }))

describe('BaseFlowMap SSR', () => {
	it('сервер отдаёт область, холст, узлы и связи с доступными именами', async () => {
		const result = await html()
		expect(result).toContain('role="region"')
		expect(result).toContain('role="graphics-document"')
		expect(result).toContain('Alpha, Сервис')
		expect(result).toContain('data-flow-entity="edge"')
		expect(result).toContain('class="base-flow-map__sr"')
	})

	it('первый узел доступен по Tab уже в разметке сервера, живой регион пуст', async () => {
		const result = await html()
		expect(result).toMatch(/tabindex="0"[^>]*data-flow-id="a"|data-flow-id="a"[^>]*tabindex="0"/)
		expect(result).toContain('aria-live="polite" aria-atomic="true"></div>')
	})

	it('загрузка, ошибка и пустая карта рендерятся без обращений к браузеру', async () => {
		expect(await html({ isLoading: true })).toContain('aria-busy="true"')
		expect(await html({ error: 'Сбой' })).toContain('Сбой')
		expect(await html({ data: mapData({ nodes: [], edges: [] }) })).toContain('base-flow-map__empty')
	})

	it('сервер не показывает компактный вид: размер области неизвестен', async () => {
		expect(await html()).not.toContain('base-flow-map--compact')
	})

	it('панель подробностей на сервере не трогает историю браузера', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		vi.stubGlobal('window', undefined)
		try {
			expect(await html({ panels: ['details'], selection: ['a'] })).toContain('role="region"')
		} finally {
			vi.unstubAllGlobals()
		}
		expect(push).not.toHaveBeenCalled()
		push.mockRestore()
	})
})
