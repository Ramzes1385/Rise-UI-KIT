import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const twoD = (container: Element): Element | null => container.querySelector('.base-flow-map-3d__pane .base-flow-map')

async function advance(times: number, ms: number): Promise<void> {
	for (let index = 0; index < times; index += 1) {
		vi.advanceTimersByTime(ms)
		env.flushFrames(ms)
		await nextTick()
	}
}

describe('BaseFlowMap3D: полёт камеры при смене вида', () => {
	afterEach(() => vi.useRealTimers())

	it('в 2D камера сначала летит сверху, вид меняется после полёта, обратно — вылет в пресет с затуханием', async () => {
		env.setMotion('standard')
		const { container, api } = await env.renderMap()
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		api().setView('2d')
		await advance(2, 100)
		expect(container.querySelector('canvas')).toBeInTheDocument()
		expect(twoD(container)).toBeNull()
		await advance(8, 100)
		vi.useRealTimers()
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		api().setView('3d')
		await advance(4, 100)
		vi.useRealTimers()
		await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
		await nextTick()
		env.flushFrames(100)
		env.flushFrames(100)
	})

	it('отмена перехода до конца полёта возвращает камеру в пресет и вид остаётся 3D', async () => {
		env.setMotion('standard')
		const { container, api } = await env.renderMap()
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		api().setView('2d')
		await advance(1, 100)
		api().setView('3d')
		await advance(8, 100)
		expect(container.querySelector('canvas')).toBeInTheDocument()
		expect(twoD(container)).toBeNull()
	})

	it('смена пресета между видами разного рода (изометрия ↔ перспектива) прыгает камерой без полёта', async () => {
		env.setMotion('standard')
		const { api, container } = await env.renderMap({ camera: 'perspective' })
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		api().setView('2d')
		await advance(8, 100)
		vi.useRealTimers()
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		api().setView('3d')
		await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
		await nextTick()
		await nextTick()
		env.flushFrames(100)
		await fireEvent.click(screen.getByRole('button', { name: 'Вид 1: изометрия' }))
	})

	it('проп `camera` на лету и поворот сцены клавишами в уменьшенном движении проходят без полёта', async () => {
		env.setMotion('none')
		const onCamera = vi.fn()
		const { rerender } = await env.renderMap({ camera: 'iso', 'onUpdate:camera': onCamera })
		await rerender({ camera: 'top' })
		await nextTick()
		env.flushFrames()
		await rerender({ camera: 'iso-270' })
		await nextTick()
		env.flushFrames()
		expect(onCamera).not.toHaveBeenCalledWith('top')
	})
})
