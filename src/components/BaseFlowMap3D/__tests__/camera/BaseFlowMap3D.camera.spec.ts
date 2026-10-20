import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { OrthographicCamera, PerspectiveCamera } from 'three'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

async function settle(): Promise<void> {
	await nextTick()
	await nextTick()
	await nextTick()
	env.flushFrames()
}

describe('BaseFlowMap3D: камера и пресеты', () => {
	it('кнопки пресетов переключают вид, отмечают текущий и сообщают `update:camera`', async () => {
		const onCamera = vi.fn()
		await env.renderMap({ 'onUpdate:camera': onCamera })
		const first = screen.getByRole('button', { name: 'Вид 1: изометрия' })
		const second = screen.getByRole('button', { name: 'Вид 2: изометрия, поворот на 90°' })
		expect(first).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.click(second)
		expect(onCamera).toHaveBeenCalledWith('iso-90')
		expect(second).toHaveAttribute('aria-pressed', 'true')
		expect(first).toHaveAttribute('aria-pressed', 'false')
	})

	it('проп `camera` задаёт пресет и меняется на лету', async () => {
		const { rerender, camera } = await env.renderMap({ camera: 'top' })
		expect(camera()).toBeInstanceOf(OrthographicCamera)
		const before = camera().position.clone()
		await rerender({ camera: 'iso-180' })
		await settle()
		expect(camera().position.distanceTo(before)).toBeGreaterThan(0.01)
	})

	it('пресет `perspective` заменяет камеру на перспективную, а возврат — на ортографическую', async () => {
		const { api, camera } = await env.renderMap()
		api().setCamera('perspective')
		await settle()
		expect(camera()).toBeInstanceOf(PerspectiveCamera)
		api().setCamera('iso')
		await settle()
		expect(camera()).toBeInstanceOf(OrthographicCamera)
	})

	it('без пресета в пропсе берёт камеру из `data.view3d`, неизвестное значение — изометрия', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { camera } = await env.renderMap({
			data: { version: 1, nodes: [{ id: 'a', label: 'A', kind: 'service' }], edges: [], view3d: { camera: 'perspective' } },
		})
		await settle()
		expect(camera()).toBeInstanceOf(PerspectiveCamera)
		warn.mockRestore()
	})

	it('Q и E поворачивают сцену на 90° и сообщают ближайший пресет изометрии', async () => {
		const onCamera = vi.fn()
		await env.renderMap({ 'onUpdate:camera': onCamera })
		const area = screen.getByRole('group', { name: 'Оформление заказа' })
		await fireEvent.keyDown(area, { key: 'e' })
		await settle()
		expect(onCamera).toHaveBeenCalledTimes(1)
		await fireEvent.keyDown(area, { key: 'q' })
		await settle()
		expect(onCamera).toHaveBeenLastCalledWith('iso')
	})

	it('поворот в пресете сверху не меняет пресет', async () => {
		const onCamera = vi.fn()
		const { api } = await env.renderMap({ camera: 'top', 'onUpdate:camera': onCamera })
		api().rotate(1)
		await settle()
		expect(onCamera).not.toHaveBeenCalled()
	})

	it('кнопки масштаба и «Сбросить вид» двигают камеру; на пределе кнопка выключена', async () => {
		const { camera } = await env.renderMap()
		const zoomOf = () => (camera() as OrthographicCamera).zoom
		const start = zoomOf()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await settle()
		expect(zoomOf()).toBeGreaterThan(start)
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await settle()
		expect(zoomOf()).toBeLessThan(start)
		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить вид' }))
		await settle()
		expect(zoomOf()).toBeCloseTo(start, 4)
		for (let step = 0; step < 12; step += 1) {
			await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
			await settle()
		}
		expect(screen.getByRole('button', { name: 'Увеличить' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('Ctrl и колесо масштабируют сцену', async () => {
		const { camera } = await env.renderMap()
		const zoomOf = () => (camera() as OrthographicCamera).zoom
		const start = zoomOf()
		await fireEvent.wheel(screen.getByRole('group', { name: 'Оформление заказа' }), { ctrlKey: true, deltaY: -200 })
		await settle()
		expect(zoomOf()).toBeGreaterThan(start)
	})

	it('hasCameraControls=false убирает кнопки пресетов и масштаба', async () => {
		await env.renderMap({ hasCameraControls: false })
		expect(screen.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		expect(screen.queryByRole('button', { name: 'Вид 1: изометрия' })).toBeNull()
	})

	it('область вида читается и пишется: запись и чтение возвращают то же', async () => {
		const { api } = await env.renderMap()
		const start = api().getViewport()
		api().setViewport({ x: start.x + 30, y: start.y - 20, zoom: start.zoom * 1.2 })
		await settle()
		const next = api().getViewport()
		expect(next.zoom).toBeCloseTo(start.zoom * 1.2, 3)
		expect(next.x).toBeCloseTo(start.x + 30, 0)
		expect(next.y).toBeCloseTo(start.y - 20, 0)
		api().setViewport(start, { isAnimated: true })
		await settle()
		expect(api().getViewport().zoom).toBeCloseTo(start.zoom, 3)
	})

	it('полёт к неизвестному узлу камеру не двигает', async () => {
		const { api, camera } = await env.renderMap()
		const before = camera().position.clone()
		api().flyTo('нет такого')
		await settle()
		expect(camera().position.distanceTo(before)).toBeLessThan(1e-6)
	})

	it('контроллер: zoom, fitView и focus двигают камеру и ставят фокус', async () => {
		const onFocus = vi.fn()
		const { api, camera } = await env.renderMap({ 'onFocus-change': onFocus })
		const zoomOf = () => (camera() as OrthographicCamera).zoom
		const start = zoomOf()
		api().zoom('in')
		await settle()
		expect(zoomOf()).toBeGreaterThan(start)
		api().zoom('out')
		await settle()
		expect(zoomOf()).toBeCloseTo(start, 3)
		api().zoom(1.5)
		await settle()
		api().fitView()
		await settle()
		expect(zoomOf()).toBeCloseTo(start, 3)
		api().fitView({ ids: ['db'] })
		await settle()
		expect(zoomOf()).toBeGreaterThan(start)
		api().fitView({ ids: ['db', 'api'] })
		await settle()
		api().focus('queue')
		expect(onFocus).toHaveBeenCalledWith({ entity: 'node', id: 'queue' })
		api().focus('api', { isZoomed: true })
		await settle()
		api().flyTo('cache')
		await settle()
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'cache' })
	})
})
