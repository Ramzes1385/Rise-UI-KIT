import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseFlowMap from '../ui/BaseFlowMap.vue'
import { UI_FLOW_PANELS } from '@/locales/messages'
import type { FlowMapData } from '../types/data/flowData.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const data: FlowMapData = {
	version: 1,
	title: 'Заказы',
	nodes: [
		{ id: 'web', kind: 'client', label: 'Сайт', position: { x: 0, y: 0 }, isPinned: true },
		{ id: 'api', kind: 'gateway', label: 'API', position: { x: 300, y: 0 }, isPinned: true, status: 'ok' },
		{ id: 'db', kind: 'database', label: 'База', position: { x: 600, y: 0 }, isPinned: true },
	],
	edges: [
		{ id: 'e1', source: 'web', target: 'api', label: 'HTTPS' },
		{ id: 'e2', source: 'api', target: 'db', label: 'SQL' },
	],
}

describe('BaseFlowMap integration', () => {
	it('путь с клавиатуры: фокус в холст, стрелка к соседу, Enter открывает подробности, Escape снимает выбор', async () => {
		const result = render(BaseFlowMap, { props: { data } })
		const web = screen.getByRole('graphics-object', { name: /^Сайт/ })
		web.focus()
		await fireEvent.keyDown(web, { key: 'ArrowRight' })
		const api = screen.getByRole('graphics-object', { name: /^API/ })
		await vi.waitFor(() => expect(api).toHaveFocus())
		await fireEvent.keyDown(api, { key: 'Enter' })
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['api']])
		expect(await screen.findByRole('region', { name: UI_FLOW_PANELS.DETAILS_NODE })).toHaveTextContent('API')
		await fireEvent.keyDown(api, { key: 'Escape' })
		expect(result.emitted()['update:selection'].at(-1)).toEqual([[]])
	})

	it('живые данные и выбор из родителя проходят через карту, не меняя данные', async () => {
		const result = render(BaseFlowMap, { props: { data, selection: ['db'] } })
		const db = screen.getByRole('graphics-object', { name: /^База/ })
		expect(db).toHaveAttribute('aria-current', 'true')
		await result.rerender({ live: { nodes: { db: { status: 'down' } } } })
		expect(db).toHaveAttribute('data-status', 'down')
		await nextTick()
		expect(result.emitted()['update:data']).toBeUndefined()
	})
})
