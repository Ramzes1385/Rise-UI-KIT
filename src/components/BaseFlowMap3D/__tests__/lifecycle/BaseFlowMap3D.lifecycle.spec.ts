import '@testing-library/jest-dom/vitest'
import { BufferGeometry } from 'three'
import { waitFor } from '@testing-library/vue'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FLOW_3D, TestResizeObserver, useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

describe('BaseFlowMap3D: жизненный цикл', () => {
	it('при размонтировании освобождает рендерер, наблюдатели и ресурсы сцены', async () => {
		const dispose = vi.spyOn(BufferGeometry.prototype, 'dispose')
		const { renderer, unmount } = await env.renderMap()
		const observers = [...TestResizeObserver.instances]
		expect(observers.length).toBeGreaterThan(0)
		dispose.mockClear()
		unmount()
		expect(renderer.dispose).toHaveBeenCalledOnce()
		expect(renderer.forceContextLoss).toHaveBeenCalledOnce()
		observers.forEach(observer => expect(observer.disconnect).toHaveBeenCalled())
		expect(dispose).toHaveBeenCalled()
	})

	it('после размонтирования кадры больше ничего не рисуют', async () => {
		const { unmount, renderer } = await env.renderMap()
		unmount()
		renderer.render.mockClear()
		env.flushFrames()
		expect(renderer.render).not.toHaveBeenCalled()
	})

	it('замена данных освобождает геометрии прежней сцены и собирает новую', async () => {
		const { rerender, renderer } = await env.renderMap()
		const dispose = vi.spyOn(BufferGeometry.prototype, 'dispose')
		const calls = renderer.render.mock.calls.length
		await rerender({ data: { ...FLOW_3D, nodes: FLOW_3D.nodes.slice(0, 2), edges: FLOW_3D.edges.slice(0, 1) } })
		env.flushFrames()
		expect(dispose).toHaveBeenCalled()
		expect(renderer.render.mock.calls.length).toBeGreaterThan(calls)
	})

	it('нулевой размер контейнера не ломает сборку: размер холста не задаётся', async () => {
		env.size.width = 0
		env.size.height = 0
		const { renderer, container } = await env.renderMap()
		expect(renderer.setSize).not.toHaveBeenCalled()
		expect(container.querySelector('canvas')).toBeInTheDocument()
	})

	it('смена размера контейнера пересчитывает холст', async () => {
		const { renderer } = await env.renderMap()
		TestResizeObserver.instances.forEach(observer =>
			observer.callback([{ contentRect: { width: 640, height: 400 } } as ResizeObserverEntry], observer as never),
		)
		expect(renderer.setSize).toHaveBeenLastCalledWith(640, 400, false)
	})

	it('размонтирование посреди загрузки GLB отбрасывает ответ без ошибок', async () => {
		let finish: (value: { scene: never; animations: never[] }) => void = () => undefined
		const load = vi
			.spyOn(GLTFLoader.prototype, 'loadAsync')
			.mockImplementation(() => new Promise(resolve => (finish = resolve as typeof finish)) as never)
		const data = {
			...FLOW_3D,
			nodes: [{ id: 'k', label: 'Киоск', kind: 'service', model3d: { url: 'https://example.test/kiosk.glb' } }],
			edges: [],
			groups: [],
		}
		const error = vi.spyOn(console, 'error')
		const { unmount } = await env.renderMap({ data })
		await waitFor(() => expect(load).toHaveBeenCalledWith('https://example.test/kiosk.glb'))
		unmount()
		const { Group } = await import('three')
		finish({ scene: new Group() as never, animations: [] })
		await Promise.resolve()
		await Promise.resolve()
		expect(error).not.toHaveBeenCalled()
	})
})
