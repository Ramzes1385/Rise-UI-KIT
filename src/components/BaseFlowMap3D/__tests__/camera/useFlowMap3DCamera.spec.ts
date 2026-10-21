import { ref } from 'vue'
import { useFlowMap3DCamera } from '../../model/camera/useFlowMap3DCamera'

const orbit = vi.hoisted(() => ({ controls: { value: null as { enabled: boolean } | null } }))

vi.mock('@/scene3d/camera/useOrbitCamera', () => ({
	useOrbitCamera: () => ({
		state: { next: () => [0, 0, 0, 0, 1, 10], controls: orbit.controls, zoom: { value: 1 }, goTo: vi.fn(), jump: vi.fn() },
		isMaxZoom: ref(false),
		isMinZoom: ref(false),
		reset: vi.fn(),
	}),
}))

describe('useFlowMap3DCamera: вращение мышью', () => {
	const make = () =>
		useFlowMap3DCamera({
			snapshot: ref({ nodes: [], groups: [], bounds: { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } } }),
			preset: ref('iso'),
			camera: ref({}),
			renderer: ref(null),
			canvasRef: ref(null),
			fitted: ref(0),
			invalidate: vi.fn(),
			getSize: () => ({ width: 100, height: 100 }),
			getBox: () => null,
			onPreset: vi.fn(),
		} as never)

	it('есть управление — флаг переключается; нет управления — ничего не падает', () => {
		const camera = make()
		orbit.controls.value = { enabled: true }
		camera.setOrbit(false)
		expect(orbit.controls.value.enabled).toBe(false)
		orbit.controls.value = null
		expect(() => camera.setOrbit(true)).not.toThrow()
	})
})
