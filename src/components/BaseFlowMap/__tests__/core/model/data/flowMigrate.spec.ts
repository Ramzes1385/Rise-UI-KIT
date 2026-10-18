import { UI_FLOW_MAP } from '@/locales/messages'
import { migrateFlowData } from '../../../../model/data/flowMigrate'
import { FLOW_DATA_VERSION } from '../../../../types/data/flowData.types'

describe('migrateFlowData', () => {
	it('данные текущей версии отдаются как есть, без замечаний', () => {
		const input = { version: 1, title: 'Заказы', nodes: [{ id: 'a', kind: 'service', label: 'A' }], edges: [] }
		const { data, issues } = migrateFlowData(input)
		expect(issues).toEqual([])
		expect(data).toEqual(input)
	})

	it('без версии — предупреждение и текущая версия', () => {
		const { data, issues } = migrateFlowData({ nodes: [], edges: [] })
		expect(data.version).toBe(FLOW_DATA_VERSION)
		expect(issues).toEqual([{ level: 'warning', code: 'version-missing', message: expect.stringContaining(String(FLOW_DATA_VERSION)) }])
	})

	it('нечисловая и бесконечная версия считаются отсутствующей', () => {
		expect(migrateFlowData({ version: '1', nodes: [], edges: [] }).issues[0].code).toBe('version-missing')
		expect(migrateFlowData({ version: Infinity, nodes: [], edges: [] }).issues[0].code).toBe('version-missing')
	})

	it('более новая версия — ошибка, данные не трогаются', () => {
		const input = { version: 99, nodes: [], edges: [], title: 'X' }
		const { data, issues } = migrateFlowData(input)
		expect(issues).toHaveLength(1)
		expect(issues[0]).toMatchObject({ level: 'error', code: 'version-unsupported' })
		expect(issues[0].message).toContain('99')
		expect(data).toEqual(input)
	})

	it('старая версия (0) поднимается до текущей', () => {
		const { data, issues } = migrateFlowData({ version: 0, nodes: [], edges: [] })
		expect(issues).toEqual([])
		expect(data.version).toBe(FLOW_DATA_VERSION)
	})

	it.each([
		{ label: 'null', input: null },
		{ label: 'строка', input: 'x' },
		{ label: 'число', input: 5 },
		{ label: 'массив', input: [] },
		{ label: 'undefined', input: undefined },
	])('не объект ($label) — ошибка и пустая карта', ({ input }) => {
		const { data, issues } = migrateFlowData(input)
		expect(issues).toEqual([{ level: 'error', code: 'invalid-data', message: UI_FLOW_MAP.ISSUE_INVALID_DATA }])
		expect(data).toEqual({ version: FLOW_DATA_VERSION, nodes: [], edges: [] })
	})

	it('нет списков узлов и связей — пустые списки и предупреждение на каждый', () => {
		const { data, issues } = migrateFlowData({ version: 1 })
		expect(data.nodes).toEqual([])
		expect(data.edges).toEqual([])
		expect(issues.map(item => item.code)).toEqual(['collection-missing', 'collection-missing'])
		expect(issues[0].message).toContain('nodes')
		expect(issues[1].message).toContain('edges')
	})

	it('список, который не массив, заменяется пустым', () => {
		const { data, issues } = migrateFlowData({ version: 1, nodes: {}, edges: [] })
		expect(data.nodes).toEqual([])
		expect(issues).toHaveLength(1)
	})

	it('исходный объект не изменяется', () => {
		const input = { nodes: [] }
		migrateFlowData(input)
		expect(input).toEqual({ nodes: [] })
	})
})
