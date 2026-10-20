import { Color, Mesh, SphereGeometry } from 'three'
import { createScenarioLayer } from '../../model/motion/scenario/scenarioToken'
import type { FlowMap3DEdgeItem, FlowMap3DPalette } from '../../types/internal/flowMap3dInternal.types'

const palette = (hex: string) =>
	({
		palette: { colors: { active: new Color(hex) } },
		resolve: (token: string) => new Color(token.includes('error') ? '#ff0000' : '#ffaa00'),
	}) as unknown as FlowMap3DPalette

const item = (id: string): FlowMap3DEdgeItem =>
	({
		id,
		edge: { id, source: 'a', target: 'b' },
		points: [
			{ x: 0, y: 0, z: 0 },
			{ x: 4, y: 0, z: 0 },
		],
	}) as FlowMap3DEdgeItem

const visibleRibbons = (layer: ReturnType<typeof createScenarioLayer>) =>
	layer.group.children.filter(child => child instanceof Mesh && !(child.geometry instanceof SphereGeometry) && child.visible)

describe('createScenarioLayer', () => {
	it('следы строятся лениво, самый длинный из повторов побеждает, неизвестная связь молчит', () => {
		const layer = createScenarioLayer([item('e1'), item('e2')], palette('#00aa00'))
		layer.set({
			tokens: [],
			trails: [
				{ step: 's1', edge: 'e1', shown: 0.8, isDone: false, status: undefined },
				{ step: 's2', edge: 'e1', shown: 0.3, isDone: false, status: 'error' },
				{ step: 's3', edge: 'ghost', shown: 1, isDone: true, status: undefined },
			],
		})
		expect(visibleRibbons(layer)).toHaveLength(1)
		layer.set({ tokens: [], trails: [{ step: 's4', edge: 'e2', shown: 0.5, isDone: false, status: 'warning' }] })
		expect(visibleRibbons(layer)).toHaveLength(1)
		layer.set({ tokens: [], trails: [] })
		expect(visibleRibbons(layer)).toHaveLength(0)
	})

	it('токены берут цвет статуса, лишние прячутся, пауза скрывает слой, перекраска меняет цвет', () => {
		const layer = createScenarioLayer([item('e1')], palette('#00aa00'))
		const mark = (status: 'error' | 'warning' | 'down' | undefined) => ({ step: 's', edge: 'e1', x: 1, y: 0, z: 0, status })
		layer.set({ tokens: [mark('error'), mark('warning'), mark(undefined)], trails: [] })
		layer.set({ tokens: [mark('down')], trails: [] })
		layer.setSuspended(true)
		expect(layer.group.visible).toBe(false)
		layer.setSuspended(false)
		layer.recolor(palette('#0000ff'))
		expect(layer.tracks.has('e1')).toBe(true)
		layer.dispose()
	})
})
