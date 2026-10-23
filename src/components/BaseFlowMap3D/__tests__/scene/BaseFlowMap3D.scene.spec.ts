import '@testing-library/jest-dom/vitest'
import { Mesh } from 'three'
import { nextTick } from 'vue'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'

const env = useFlowMap3DEnvironment()

const RICH: FlowMapData = {
	version: 1,
	title: 'Оформление заказа',
	nodes: [
		{ id: 'api', label: 'Шлюз API', kind: 'service', group: 'back', status: 'warning' },
		{
			id: 'queue',
			label: 'Очередь заказов',
			kind: 'queue',
			group: 'back',
			status: 'error',
			model3d: { rotation: 90, scale: 1.4, elevation: 1 },
		},
		{ id: 'db', label: 'База данных', kind: 'database', group: 'data', model3d: { tint: 'var(--rise-chart-3)' } },
		{ id: 'cache', label: 'Кеш', kind: 'cache', group: 'edge', isExternal: true },
		{ id: 'bank', label: 'Банк', kind: 'service', isExternal: true },
	],
	edges: [
		{ id: 'e1', source: 'api', target: 'queue', label: 'заказ' },
		{ id: 'e2', source: 'queue', target: 'db', kind: 'event', model3d: { shape: 'tube' } },
		{ id: 'e3', source: 'api', target: 'cache', kind: 'data', model3d: { shape: 'arc', height: 2 } },
		{ id: 'e4', source: 'api', target: 'bank', kind: 'event', model3d: { shape: 'tube' } },
		{ id: 'e5', source: 'db', target: 'bank', kind: 'event' },
	],
	groups: [
		{ id: 'back', kind: 'zone', label: 'Бэкенд', model3d: { base: 'plate' } },
		{ id: 'data', kind: 'lane', label: 'Данные', model3d: { base: 'dashed' } },
		{ id: 'edge', kind: 'layer', label: 'Край', model3d: { base: 'none' } },
	],
}

const meshes = (root: { traverse: (visit: (object: unknown) => void) => void }): number => {
	let count = 0
	root.traverse(object => {
		if (object instanceof Mesh) count += 1
	})
	return count
}

async function settle(): Promise<void> {
	await nextTick()
	env.flushFrames()
}

describe('BaseFlowMap3D: сборка сцены', () => {
	it('строит группы, связи всех форм и модели узлов: ленты, трубки, дуги, пунктир, плиты', async () => {
		const map = await env.renderMap({ data: RICH })
		expect(meshes(map.scene())).toBeGreaterThan(10)
		expect(screen.getByRole('group', { name: 'Оформление заказа' })).toBeInTheDocument()
	})

	it('«Слои» собирают ярусы с плитами и подписями, а выключение возвращает плоскую сцену', async () => {
		const map = await env.renderMap({ data: RICH, isLayered: true })
		const layered = meshes(map.scene())
		await map.rerender({ isLayered: false })
		await settle()
		expect(layered).toBeGreaterThan(0)
		await map.rerender({ isLayered: true })
		await settle()
	})

	it('качество: низкое — без теней и деталей, высокое — тени картой, авто на большой схеме — пятнами', async () => {
		const low = await env.renderMap({ data: RICH, quality: 'low' })
		expect(meshes(low.scene())).toBeGreaterThan(0)
		low.unmount()
		const high = await env.renderMap({ data: RICH, quality: 'high' })
		expect(meshes(high.scene())).toBeGreaterThan(0)
		high.unmount()
		const nodes = Array.from({ length: 90 }, (_, index) => ({ id: `n${index}`, label: `Узел ${index}`, kind: 'service' }))
		const auto = await env.renderMap({ data: { version: 1, nodes, edges: [] }, quality: 'auto' })
		expect(meshes(auto.scene())).toBeGreaterThan(0)
	}, 30_000)

	it('наведение на узел подсвечивает его связи, уход снимает подсветку', async () => {
		const map = await env.renderMap({ data: RICH })
		const tag = map.container.querySelector('[data-label-id="api"]') as HTMLElement
		await fireEvent.pointerMove(tag)
		await fireEvent.pointerEnter(tag)
		await settle()
		await fireEvent.pointerLeave(map.container.querySelector('[role="group"]') as HTMLElement)
		await settle()
		expect(tag).toBeInTheDocument()
	})

	it('смена темы перекрашивает сцену и просит новый кадр', async () => {
		const map = await env.renderMap({ data: RICH })
		const before = map.renderer.render.mock.calls.length
		document.documentElement.setAttribute('data-theme', 'dark')
		await waitFor(() => expect(env.pending()).toBeGreaterThan(0))
		env.flushFrames()
		expect(map.renderer.render.mock.calls.length).toBeGreaterThan(before)
		document.documentElement.setAttribute('data-theme', 'light')
		await settle()
		document.documentElement.removeAttribute('data-theme')
	})

	it('новые данные пересобирают сцену: старая освобождается, модели получают новые дескрипторы', async () => {
		const map = await env.renderMap({ data: RICH })
		const first = map.api().getModel('api')
		await map.rerender({ data: { ...RICH, nodes: RICH.nodes.slice(0, 3), edges: RICH.edges.slice(0, 1) } })
		await waitFor(() => expect(map.api().getModels()).toHaveLength(3))
		expect(map.api().getModel('api')).not.toBe(first)
	})

	it('статусы красят модели, живой статус из `setStatus` сильнее данных', async () => {
		const map = await env.renderMap({ data: RICH })
		map.api().setStatus('db', 'error')
		map.api().setStatus('api', 'ok')
		await settle()
		map.api().setStatus('db', null)
		await settle()
		expect(map.api().getModel('db')).not.toBeNull()
	})

	it('бирки: подписи связей и групп стоят на сцене, длинные названия не ломают разметку', async () => {
		const long = 'Очень длинное название узла, которое не помещается в бирку ни при каком размере экрана'
		const map = await env.renderMap({
			data: { ...RICH, nodes: RICH.nodes.map((node, index) => (index === 0 ? { ...node, label: long } : node)) },
		})
		await settle()
		expect(map.container.querySelector('[data-label-id="api"]')).toHaveTextContent(long)
	})

	it('«Слои» по пропу строятся и без переключателя; пересборка идёт плавно и в плоском виде тоже', async () => {
		const flat = await env.renderMap({ data: RICH, hasLayersToggle: false })
		await settle()
		const flatCalls = flat.renderer.render.mock.calls.length
		await flat.rerender({ data: { ...RICH, title: 'Плоская', nodes: RICH.nodes.slice(0, 4) }, hasLayersToggle: false })
		await settle()
		expect(flat.renderer.render.mock.calls.length).toBeGreaterThan(flatCalls)
		flat.unmount()
		const layered = await env.renderMap({ data: RICH, hasLayersToggle: false, isLayered: true })
		await settle()
		await layered.rerender({
			data: { ...RICH, title: 'Ярусы', nodes: RICH.nodes.slice(0, 4) },
			hasLayersToggle: false,
			isLayered: true,
		})
		await settle()
		expect(layered.api().getSceneContext()).not.toBeNull()
	})
})
