import { ref } from 'vue'
import { Vector3 } from 'three'
import { useFlowMap3DFlights } from '../../model/camera/useFlowMap3DFlights'
import type { FlowMap3DPreset } from '../../types/internal/flowMap3dInternal.types'

function setup(initial: FlowMap3DPreset) {
	const state = {
		next: vi.fn(() => [1, 2, 3, 0.4, 1, 20] as never),
		goTo: vi.fn(),
		jump: vi.fn(),
	}
	const preset = ref<FlowMap3DPreset>(initial)
	const flights = useFlowMap3DFlights({ state: state as never, preset, getCenter: () => new Vector3(0, 0, 0) })
	return { state, preset, flights }
}

describe('useFlowMap3DFlights', () => {
	it('пресет того же рода — плавный полёт; другого рода — прыжок после двух тиков', async () => {
		const { state, preset, flights } = setup('iso')
		flights.setPreset('iso-90')
		expect(state.goTo).toHaveBeenCalledOnce()
		expect(preset.value).toBe('iso-90')
		flights.setPreset('perspective')
		expect(state.jump).not.toHaveBeenCalled()
		await vi.waitFor(() => expect(state.jump).toHaveBeenCalledOnce())
	})

	it('полёт в 2D выпрямляет поворот до целого оборота и поднимает камеру на предел', () => {
		const { state, flights } = setup('iso')
		flights.flyTo2d()
		const pose = state.goTo.mock.calls[0][0] as number[]
		expect(pose[3]).toBeCloseTo(0)
		expect(pose[4]).toBeLessThan(0.2)
		expect(pose[5]).toBe(20)
	})

	it('возврат из 2D: тот же род — полёт в пресет с прежним приближением; другой род — смена пресета', async () => {
		const same = setup('iso')
		same.flights.flyFrom2d('iso-90')
		expect(same.preset.value).toBe('iso-90')
		expect((same.state.goTo.mock.calls[0][0] as number[])[5]).toBe(20)
		const other = setup('iso')
		other.flights.flyFrom2d('perspective')
		expect(other.preset.value).toBe('perspective')
		await vi.waitFor(() => expect(other.state.jump).toHaveBeenCalledOnce())
	})
})
