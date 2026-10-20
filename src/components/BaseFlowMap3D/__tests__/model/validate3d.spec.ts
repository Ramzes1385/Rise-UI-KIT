import { warnFlow3d } from '../../model/validate3d'
import { node } from '../helpers/fakeModel.test-utils'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'

const base: FlowMapData = { version: 1, nodes: [node('a')], edges: [] }

function warnings(data: FlowMapData): string[] {
	const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	warnFlow3d(data)
	const texts = spy.mock.calls.map(([text]) => String(text))
	spy.mockRestore()
	return texts
}

describe('warnFlow3d', () => {
	afterEach(() => vi.unstubAllEnvs())

	it('корректные 3D-поля тихи', () => {
		expect(
			warnings({
				...base,
				nodes: [node('a', { model3d: { rotation: 90, scale: 2, elevation: 1 } })],
				edges: [{ id: 'e', source: 'a', target: 'a', model3d: { shape: 'arc', height: 2 } }],
				groups: [{ id: 'g', kind: 'zone', label: 'G', model3d: { base: 'plate' } }],
				view3d: { camera: 'top', unit: 20, quality: 'low' },
			}),
		).toEqual([])
		expect(warnings(base)).toEqual([])
		expect(warnings({ ...base, nodes: [node('a', { model3d: {} })] })).toEqual([])
	})

	it('поворот не кратен 90°', () => {
		expect(warnings({ ...base, nodes: [node('a', { model3d: { rotation: 100 } })] })).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: у узла «a» поворот 100° не кратен 90° — взято 90°',
		])
	})

	it('масштаб не больше нуля и не число', () => {
		const found = (scale: number) => warnings({ ...base, nodes: [node('a', { model3d: { scale } })] })
		expect(found(0)).toEqual(['[rise-ui-kit] BaseFlowMap3D: у узла «a» масштаб 0 не больше 0 — взят 1'])
		expect(found(Number.NaN)).toHaveLength(1)
	})

	it('подъём не число', () => {
		expect(warnings({ ...base, nodes: [node('a', { model3d: { elevation: Number.NaN } })] })).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: у узла «a» подъём не число — взят 0',
		])
	})

	it('форма связи неизвестна и высота дуги не больше нуля', () => {
		const edge = (model3d: unknown) => ({ ...base, edges: [{ id: 'e', source: 'a', target: 'a', model3d: model3d as never }] })
		expect(warnings(edge({ shape: 'spiral' }))).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: у связи «e» форма «spiral» неизвестна — нарисована лента',
		])
		expect(warnings(edge({ height: -1 }))).toEqual(['[rise-ui-kit] BaseFlowMap3D: у связи «e» высота дуги -1 не больше 0 — взята 1,5'])
		expect(warnings({ ...base, edges: [{ id: 'e', source: 'a', target: 'a' }] })).toEqual([])
	})

	it('основание группы неизвестно', () => {
		const groups = [{ id: 'g', kind: 'zone', label: 'G', model3d: { base: 'wall' as never } }]
		expect(warnings({ ...base, groups })).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: у группы «g» основание «wall» неизвестно — взята пунктирная рамка',
		])
		expect(warnings({ ...base, groups: [{ id: 'g', kind: 'zone', label: 'G' }] })).toEqual([])
	})

	it('камера, единица плана и качество в `view3d`', () => {
		expect(warnings({ ...base, view3d: { camera: 'side' } })).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: view3d.camera «side» неизвестен — взята изометрия',
		])
		expect(warnings({ ...base, view3d: { unit: 0 } })).toEqual(['[rise-ui-kit] BaseFlowMap3D: view3d.unit 0 не больше 0 — взято 40'])
		expect(warnings({ ...base, view3d: { quality: 'ultra' as never } })).toEqual([
			'[rise-ui-kit] BaseFlowMap3D: view3d.quality «ultra» неизвестно — взято auto',
		])
	})

	it('больше 300 узлов — предупреждение о тесноте', () => {
		const nodes = Array.from({ length: 301 }, (_, index) => node(`n${index}`))
		expect(warnings({ ...base, nodes })).toEqual(['[rise-ui-kit] BaseFlowMap3D: узлов 301 — больше 300, сцена может отставать'])
		expect(warnings({ ...base, nodes: nodes.slice(0, 300) })).toEqual([])
	})

	it('в сборке для production консоль молчит', () => {
		vi.stubEnv('NODE_ENV', 'production')
		expect(warnings({ ...base, nodes: [node('a', { model3d: { scale: -1 } })] })).toEqual([])
	})
})
