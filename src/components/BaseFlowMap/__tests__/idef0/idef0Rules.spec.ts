import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import type { FlowEdge, FlowMapData, FlowNode, FlowPort } from '../../types/data/flowData.types'
import { boundary, edge, fn, graphOf, idef0Diagram, mapData, node, port } from '../fixtures/idefData'
import { boundaryRoleOf, codeOrder, idef0KindOf, idef0Rules, portRole } from '../../model/notations/idef0/idef0Rules'

interface ConnectOptions {
	sourcePort?: FlowPort
	targetPort?: FlowPort
}

function connect(source: FlowNode, target: FlowNode, options: ConnectOptions = {}) {
	const data = mapData([source, target], [])
	return idef0Rules.canConnect!({ source, target, kind: 'arrow', data, graph: graphOf(data.nodes, data.edges), ...options })
}

function validate(nodes: FlowNode[], edges: FlowEdge[] = []) {
	const data: FlowMapData = mapData(nodes, edges)
	return idef0Rules.validate!(data, graphOf(nodes, edges))
}

function codes(nodes: FlowNode[], edges: FlowEdge[] = []): string[] {
	return validate(nodes, edges).map(issue => issue.code)
}

function wired(nodesList: FlowNode[]): { nodes: FlowNode[]; edges: FlowEdge[] } {
	const functions = nodesList.filter(item => item.kind === 'function')
	const extra: FlowNode[] = []
	const edges: FlowEdge[] = []
	functions.forEach(item => {
		extra.push(boundary(`c-${item.id}`, 'control'))
		edges.push(edge(`ec-${item.id}`, `c-${item.id}>${item.id}`, { targetPort: 'control' }))
		edges.push(edge(`eo-${item.id}`, `${item.id}>o-${item.id}`, { sourcePort: 'output' }))
		extra.push(boundary(`o-${item.id}`, 'output'))
	})
	return { nodes: [...nodesList, ...extra], edges }
}

describe('IDEF0: вспомогательные функции', () => {
	it('idef0KindOf отбрасывает префикс нотации', () => {
		expect(idef0KindOf({ kind: 'idef0:function' })).toBe('function')
		expect(idef0KindOf({ kind: 'boundary' })).toBe('boundary')
	})

	it('boundaryRoleOf читает роль стрелки, по умолчанию это вход', () => {
		expect(boundaryRoleOf(boundary('b', 'control'))).toBe('control')
		expect(boundaryRoleOf(boundary('b', 'output'))).toBe('output')
		expect(boundaryRoleOf(boundary('b', 'mechanism'))).toBe('mechanism')
		expect(boundaryRoleOf(boundary('b', 'input'))).toBe('input')
		expect(boundaryRoleOf(boundary('b', 'другое'))).toBe('input')
		expect(boundaryRoleOf(boundary('b'))).toBe('input')
		expect(boundaryRoleOf({})).toBe('input')
	})

	it('codeOrder берёт число из номера и даёт 0 без цифр', () => {
		expect(codeOrder('A12')).toBe(12)
		expect(codeOrder('A2.3')).toBe(23)
		expect(codeOrder('')).toBe(0)
		expect(codeOrder('ABC')).toBe(0)
	})

	it('portRole находит роль порта узла, иначе возвращает сам id порта', () => {
		const owner = node('f', 'function', { ports: [port('left-1', 'input')] })
		expect(portRole(owner, undefined)).toBeUndefined()
		expect(portRole(owner, 'left-1')).toBe('input')
		expect(portRole(owner, 'control')).toBe('control')
		expect(portRole(node('g', 'function'), 'output')).toBe('output')
	})
})

describe('IDEF0: правила соединения', () => {
	it('объявляет одну стрелку между функциями и граничными стрелками', () => {
		expect(idef0Rules.connections).toEqual([{ edge: 'arrow', from: ['function', 'boundary'], to: ['function', 'boundary'] }])
	})

	it('разрешает выход одной функции во вход другой', () => {
		const result = connect(fn('a', 'A1'), fn('b', 'A2'), { sourcePort: port('output', 'output'), targetPort: port('input', 'input') })
		expect(result).toBe(true)
	})

	it('разрешает связь между функциями без портов', () => {
		expect(connect(fn('a'), fn('b'))).toBe(true)
	})

	it.each([
		['input', UI_FLOW_IDEF.PORT_INPUT],
		['control', UI_FLOW_IDEF.PORT_CONTROL],
		['mechanism', UI_FLOW_IDEF.PORT_MECHANISM],
	])('запрещает начинать стрелку с порта «%s» и называет роль подписью', (role, label) => {
		const result = connect(fn('a'), fn('b'), { sourcePort: port(role, role) })
		expect(result).toEqual({ code: 'idef0-source-role', message: formatMessage(UI_FLOW_IDEF.RULE_SOURCE_ROLE, { role: label }) })
	})

	it.each([
		['output', UI_FLOW_IDEF.PORT_OUTPUT],
		['call', UI_FLOW_IDEF.PORT_CALL],
	])('запрещает заканчивать стрелку в порту «%s»', (role, label) => {
		const result = connect(fn('a'), fn('b'), { targetPort: port(role, role) })
		expect(result).toEqual({ code: 'idef0-target-role', message: formatMessage(UI_FLOW_IDEF.RULE_TARGET_ROLE, { role: label }) })
	})

	it('запрещает соединять две граничные стрелки', () => {
		expect(connect(boundary('a', 'input'), boundary('b', 'output'))).toEqual({
			code: 'idef0-boundary-pair',
			message: UI_FLOW_IDEF.RULE_BOUNDARY_PAIR,
		})
	})

	describe('граничная стрелка → функция', () => {
		it('выходная граничная стрелка — конец, она ничего не отдаёт', () => {
			expect(connect(boundary('o', 'output'), fn('a'))).toEqual({
				code: 'idef0-boundary-direction',
				message: UI_FLOW_IDEF.RULE_OUTPUT_IS_SINK,
			})
		})

		it('стрелка управления подключается к порту управления', () => {
			expect(connect(boundary('c', 'control'), fn('a'), { targetPort: port('control', 'control') })).toBe(true)
		})

		it('стрелка управления не подключается к входу', () => {
			expect(connect(boundary('c', 'control'), fn('a'), { targetPort: port('input', 'input') })).toEqual({
				code: 'idef0-role-mismatch',
				message: formatMessage(UI_FLOW_IDEF.RULE_ROLE_MISMATCH, { role: UI_FLOW_IDEF.PORT_CONTROL }),
			})
		})

		it('без порта приёмника роль не сверяется', () => {
			expect(connect(boundary('i', 'input'), fn('a'))).toBe(true)
		})

		it('роль порта берётся из описания портов узла, если есть', () => {
			const target = fn('a', 'A1', { ports: [port('p-left', 'input')] })
			expect(connect(boundary('m', 'mechanism'), target, { targetPort: port('p-left', 'input') })).toMatchObject({
				code: 'idef0-role-mismatch',
			})
		})
	})

	describe('функция → граничная стрелка', () => {
		it('в выходную стрелку ведёт выход функции', () => {
			expect(connect(fn('a'), boundary('o', 'output'), { sourcePort: port('output', 'output') })).toBe(true)
		})

		it('без порта источника выходная стрелка принимается', () => {
			expect(connect(fn('a'), boundary('o', 'output'))).toBe(true)
		})

		it.each(['input', 'control', 'mechanism'])('за границу уходит только выход: стрелка «%s» отклоняется', role => {
			expect(connect(fn('a'), boundary('b', role))).toEqual({
				code: 'idef0-boundary-direction',
				message: UI_FLOW_IDEF.RULE_ONLY_OUTPUT_LEAVES,
			})
		})

		it('порт вызова — не выход: в выходную стрелку из него не ведут', () => {
			const result = connect(fn('a', 'A1', { ports: [port('p-bottom', 'call')] }), boundary('o', 'output'), {
				sourcePort: port('p-bottom', 'call'),
			})
			expect(result).toMatchObject({ code: 'idef0-role-mismatch' })
		})

		it('порт с ролью вне списка «только приёмников» и не выход даёт несовпадение роли', () => {
			const source = fn('a', 'A1', { ports: [port('extra', 'custom')] })
			expect(connect(source, boundary('o', 'output'), { sourcePort: port('extra', 'custom') })).toEqual({
				code: 'idef0-role-mismatch',
				message: formatMessage(UI_FLOW_IDEF.RULE_ROLE_MISMATCH, { role: UI_FLOW_IDEF.PORT_OUTPUT }),
			})
		})
	})
})

describe('IDEF0: проверка данных', () => {
	it('диаграмма из трёх функций со всеми стрелками не даёт предупреждений о счёте и номерах', () => {
		const { nodes, edges } = idef0Diagram()
		expect(codes(nodes, edges)).not.toEqual(expect.arrayContaining(['idef0-function-count', 'idef0-code-gap', 'idef0-code-duplicate']))
	})

	it('пустая карта и одна функция (контекстная диаграмма A-0) не получают предупреждения о числе функций', () => {
		expect(codes([])).toEqual([])
		expect(codes([fn('a', 'A0')])).not.toContain('idef0-function-count')
	})

	it('две функции — предупреждение о числе, с самим числом', () => {
		const issues = validate([fn('a', 'A1'), fn('b', 'A2')])
		const count = issues.find(issue => issue.code === 'idef0-function-count')
		expect(count).toMatchObject({ level: 'warning', message: formatMessage(UI_FLOW_IDEF.WARN_FUNCTION_COUNT, { count: 2 }) })
		expect(count?.target).toBeUndefined()
	})

	it.each([3, 6])('%i функции — число в норме', total => {
		const functions = Array.from({ length: total }, (_, index) => fn(`f${index}`, `A${index + 1}`))
		expect(codes(functions)).not.toContain('idef0-function-count')
	})

	it('семь функций — предупреждение о числе', () => {
		const functions = Array.from({ length: 7 }, (_, index) => fn(`f${index}`, `A${index + 1}`))
		expect(codes(functions)).toContain('idef0-function-count')
	})

	it('повтор номера — предупреждение у повторяющегося узла, без второго предупреждения о пропуске', () => {
		const issues = validate([fn('a', 'A1'), fn('b', 'A2'), fn('c', 'A2')])
		const duplicates = issues.filter(issue => issue.code === 'idef0-code-duplicate')
		expect(duplicates).toEqual([
			{
				level: 'warning',
				code: 'idef0-code-duplicate',
				message: formatMessage(UI_FLOW_IDEF.WARN_CODE_DUPLICATE, { code: 'A2' }),
				target: { entity: 'node', id: 'c' },
			},
		])
		expect(issues.map(issue => issue.code)).not.toContain('idef0-code-gap')
	})

	it('пропуск номера — предупреждение без привязки к узлу', () => {
		const issues = validate([fn('a', 'A1'), fn('b', 'A3'), fn('c', 'A4')])
		const gap = issues.find(issue => issue.code === 'idef0-code-gap')
		expect(gap).toEqual({ level: 'warning', code: 'idef0-code-gap', message: UI_FLOW_IDEF.WARN_CODE_GAP })
	})

	it('функция без номера считается пропуском в нумерации', () => {
		expect(codes([fn('a'), fn('b'), fn('c')])).toContain('idef0-code-gap')
	})

	it('номера подряд в любом порядке данных — без предупреждения', () => {
		expect(codes([fn('c', 'A3'), fn('a', 'A1'), fn('b', 'A2')])).not.toContain('idef0-code-gap')
	})

	it('функция без управления и без выхода получает оба предупреждения с её именем', () => {
		const issues = validate([fn('a', 'A1')])
		expect(issues).toContainEqual({
			level: 'warning',
			code: 'idef0-no-control',
			message: formatMessage(UI_FLOW_IDEF.WARN_NO_CONTROL, { name: 'a' }),
			target: { entity: 'node', id: 'a' },
		})
		expect(issues).toContainEqual({
			level: 'warning',
			code: 'idef0-no-output',
			message: formatMessage(UI_FLOW_IDEF.WARN_NO_OUTPUT, { name: 'a' }),
			target: { entity: 'node', id: 'a' },
		})
	})

	it('управление и выход есть — предупреждений о стрелках нет', () => {
		const { nodes, edges } = wired([fn('a', 'A1'), fn('b', 'A2'), fn('c', 'A3')])
		expect(codes(nodes, edges)).toEqual([])
	})

	it('управление определяется по порту приёмника связи', () => {
		const nodes = [fn('x', 'A1'), fn('a', 'A2'), fn('b', 'A3')]
		const edges = [edge('e1', 'x>a', { targetPort: 'control' })]
		const issues = validate(nodes, edges)
		expect(issues.filter(issue => issue.code === 'idef0-no-control').map(issue => issue.target?.id)).toEqual(['x', 'b'])
	})

	it('вход без порта от граничной стрелки управления тоже считается управлением', () => {
		const nodes = [boundary('c', 'control'), fn('a', 'A1')]
		const issues = validate(nodes, [edge('e1', 'c>a')])
		expect(issues.map(issue => issue.code)).not.toContain('idef0-no-control')
	})

	it('вход без порта от функции или от стрелки-входа — это вход, не управление', () => {
		const nodes = [boundary('i', 'input'), fn('p', 'A1'), fn('a', 'A2')]
		const issues = validate(nodes, [edge('e1', 'i>a'), edge('e2', 'p>a')])
		expect(issues.filter(issue => issue.code === 'idef0-no-control').map(issue => issue.target?.id)).toEqual(['p', 'a'])
	})

	it('связь с несуществующим источником без порта считается входом', () => {
		const nodes = [fn('a', 'A1')]
		expect(codes(nodes, [edge('e1', 'ghost>a')])).toContain('idef0-no-control')
	})

	it('исходящая связь без порта считается выходом, с портом механизма — нет', () => {
		const nodes = [fn('a', 'A1'), fn('b', 'A2')]
		const withoutPort = validate(nodes, [edge('e1', 'a>b')])
		expect(withoutPort.filter(issue => issue.code === 'idef0-no-output').map(issue => issue.target?.id)).toEqual(['b'])
		const withCall = validate(nodes, [edge('e1', 'a>b', { sourcePort: 'call' })])
		expect(withCall.filter(issue => issue.code === 'idef0-no-output').map(issue => issue.target?.id)).toEqual(['a', 'b'])
	})
})
