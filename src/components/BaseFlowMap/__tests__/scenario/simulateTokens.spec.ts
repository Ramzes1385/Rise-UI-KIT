import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { simulateTokens } from '../../model/scenario/simulateTokens'
import { edge, graphOf, node } from '../helpers/flowFixtures.test-utils'
import type { FlowSimulationConfig } from '../../types/internal/flowScenarioInternal.types'
import type { FlowScenarioAction, FlowScenarioParallel, FlowScenarioStep } from '../../types/data/flowScenario.types'

const config: FlowSimulationConfig = {
	id: 'sim',
	label: 'Обход',
	gateways: {
		and: { split: 'all', join: 'all' },
		xor: { split: 'one', join: 'one' },
		or: { split: 'some', join: 'some' },
		andSplit: { split: 'all', join: 'one' },
	},
}

function edgesOf(steps: FlowScenarioStep[] | undefined): string[][] {
	return (steps ?? []).map(step => {
		if (step.type === 'parallel') {
			return (step as FlowScenarioParallel).branches.flat().map(item => (item as FlowScenarioAction).edge ?? '')
		}
		return [(step as FlowScenarioAction).edge ?? '']
	})
}

guardConsole()

describe('simulateTokens', () => {
	it('линейная цепочка: по шагу на связь, id шагов с номером, подпись связи или узла, статус связи', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c')],
			[edge('e1', 'a', 'b', { label: 'запрос' }), edge('e2', 'b', 'c', { status: 'error' })],
		)
		const result = simulateTokens(graph, {}, config)
		expect(result).toMatchObject({ id: 'sim', label: 'Обход' })
		expect(result?.steps).toEqual([
			{ id: 'sim-1', edge: 'e1', label: 'запрос', status: undefined },
			{ id: 'sim-2', edge: 'e2', label: 'C', status: 'error' },
		])
	})

	it('нет стартовых узлов или связей — null', () => {
		expect(simulateTokens(graphOf([node('a')], []), {}, config)).toBeNull()
		expect(simulateTokens(graphOf([node('a'), node('b')], [edge('e1', 'a', 'b'), edge('e2', 'b', 'a')]), {}, config)).toBeNull()
	})

	it('связь на несуществующий узел не даёт шага', () => {
		const graph = graphOf([node('a')], [edge('e1', 'a', 'ghost')])
		expect(simulateTokens(graph, {}, config)).toBeNull()
	})

	it('разветвление на все выходы: один круг с параллельными ветками, затем слияние по умолчанию — по каждому входу', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c'), node('d'), node('z')],
			[edge('ab', 'a', 'b'), edge('ac', 'a', 'c'), edge('bd', 'b', 'd'), edge('cd', 'c', 'd'), edge('dz', 'd', 'z')],
		)
		const result = simulateTokens(graph, {}, config)
		expect(edgesOf(result?.steps)).toEqual([
			['ab', 'ac'],
			['bd', 'cd'],
			['dz', 'dz'],
		])
		expect(result?.steps[0]).toMatchObject({ type: 'parallel', id: 'sim-p1' })
	})

	it('parallel join (all): ждёт токены со всех входов и идёт дальше один раз', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c'), node('d', 'and'), node('z')],
			[edge('ab', 'a', 'b'), edge('ac', 'a', 'c'), edge('bd', 'b', 'd'), edge('cd', 'c', 'd'), edge('dz', 'd', 'z')],
		)
		expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ab', 'ac'], ['bd', 'cd'], ['dz']])
	})

	it('join (all) не срабатывает, пока токен идёт по более длинной ветке, и срабатывает после неё', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('x'), node('c'), node('d', 'and'), node('z')],
			[
				edge('ab', 'a', 'b'),
				edge('ax', 'a', 'x'),
				edge('xc', 'x', 'c'),
				edge('bd', 'b', 'd'),
				edge('cd', 'c', 'd'),
				edge('dz', 'd', 'z'),
			],
		)
		expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ab', 'ax'], ['bd', 'xc'], ['cd'], ['dz']])
	})

	it('join (all) без токена на одном входе не срабатывает никогда', () => {
		const graph = graphOf(
			[node('a'), node('s'), node('d', 'and'), node('z')],
			[edge('ad', 'a', 'd'), edge('sd', 's', 'd', { id: 'sd' }), edge('dz', 'd', 'z')],
		)
		const result = simulateTokens(graph, {}, { ...config, isStart: item => item.id === 'a' })
		expect(edgesOf(result?.steps)).toEqual([['ad']])
	})

	it('join (all): несколько токенов по одному входу засчитываются по одному за срабатывание', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c'), node('d', 'and'), node('z')],
			[
				edge('ab1', 'a', 'b'),
				edge('ab2', 'a', 'b'),
				edge('ac', 'a', 'c'),
				edge('bd', 'b', 'd'),
				edge('cd', 'c', 'd'),
				edge('dz', 'd', 'z'),
			],
		)
		expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ab1', 'ab2', 'ac'], ['bd', 'bd', 'cd'], ['dz']])
	})

	it('inclusive join (some) ждёт токен на длинной цепочке и на ромбе, не срабатывает рано', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c'), node('j', 'or'), node('d'), node('e'), node('f'), node('g'), node('z')],
			[
				edge('ab', 'a', 'b'),
				edge('ac', 'a', 'c'),
				edge('bj', 'b', 'j'),
				edge('cd', 'c', 'd'),
				edge('ce', 'c', 'e'),
				edge('df', 'd', 'f'),
				edge('ef', 'e', 'f'),
				edge('fg', 'f', 'g'),
				edge('gj', 'g', 'j'),
				edge('jz', 'j', 'z'),
			],
		)
		const flat = edgesOf(simulateTokens(graph, {}, config)?.steps).flat()
		expect(flat.filter(item => item === 'jz')).toHaveLength(1)
		expect(flat.indexOf('jz')).toBeGreaterThan(flat.indexOf('gj'))
	})

	it('inclusive join (some) не зависит от порядка узлов: токен, идущий в том же круге, учитывается', () => {
		const flows = [
			edge('ab', 'a', 'b'),
			edge('ac', 'a', 'c'),
			edge('bj', 'b', 'j'),
			edge('cd', 'c', 'd'),
			edge('dj', 'd', 'j'),
			edge('jz', 'j', 'z'),
		]
		for (const order of [
			['a', 'b', 'c', 'd', 'j', 'z'],
			['a', 'b', 'c', 'j', 'd', 'z'],
		]) {
			const graph = graphOf(
				order.map(id => node(id, id === 'j' ? 'or' : 'service')),
				flows,
			)
			expect(edgesOf(simulateTokens(graph, {}, config)?.steps), order.join()).toEqual([['ab', 'ac'], ['bj', 'cd'], ['dj'], ['jz']])
		}
	})

	it('inclusive join (some) ждёт и токен, который только что вышел на цепочку к слиянию', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('c'), node('d1'), node('d2'), node('j', 'or'), node('z')],
			[
				edge('ab', 'a', 'b'),
				edge('ac', 'a', 'c'),
				edge('bj', 'b', 'j'),
				edge('cd1', 'c', 'd1'),
				edge('d1d2', 'd1', 'd2'),
				edge('d2j', 'd2', 'j'),
				edge('jz', 'j', 'z'),
			],
		)
		expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ab', 'ac'], ['bj', 'cd1'], ['d1d2'], ['d2j'], ['jz']])
	})

	describe('exclusive split (one)', () => {
		const graph = graphOf(
			[node('a'), node('x', 'xor'), node('p'), node('f'), node('q')],
			[
				edge('ax', 'a', 'x'),
				edge('xp', 'x', 'p', { condition: 'оплачено', label: 'да' }),
				edge('xf', 'x', 'f', { condition: 'отказ', isDefault: true }),
				edge('xq', 'x', 'q'),
			],
		)

		it('без выбора идёт связь по умолчанию (isDefault)', () => {
			expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ax'], ['xf']])
		})

		it('выбор находит связь по id, узлу-приёмнику, условию или подписи', () => {
			for (const key of ['xp', 'p', 'оплачено', 'да']) {
				expect(edgesOf(simulateTokens(graph, { x: key }, config)?.steps)).toEqual([['ax'], ['xp']])
			}
		})

		it('выбор, которого нет среди связей, не мешает: идёт связь по умолчанию', () => {
			expect(edgesOf(simulateTokens(graph, { x: 'нет такой' }, config)?.steps)).toEqual([['ax'], ['xf']])
		})

		it('без isDefault берётся первая связь на ещё не пройденный узел, иначе первая', () => {
			const plain = graphOf(
				[node('o'), node('s'), node('x', 'xor'), node('q')],
				[edge('os', 'o', 's'), edge('sx', 's', 'x'), edge('xs', 'x', 's'), edge('xq', 'x', 'q')],
			)
			expect(edgesOf(simulateTokens(plain, {}, config)?.steps)).toEqual([['os'], ['sx'], ['xq']])
			const back = graphOf(
				[node('o'), node('s'), node('x', 'xor')],
				[edge('os', 'o', 's'), edge('sx', 's', 'x'), edge('xs', 'x', 's'), edge('xs2', 'x', 's')],
			)
			const result = simulateTokens(back, {}, { ...config, maxSteps: 5 })
			expect(edgesOf(result?.steps)).toEqual([['os'], ['sx'], ['xs'], ['sx'], ['xs']])
		})
	})

	describe('inclusive split (some)', () => {
		const graph = graphOf(
			[node('a'), node('o', 'or'), node('p'), node('q'), node('r')],
			[
				edge('ao', 'a', 'o'),
				edge('op', 'o', 'p', { condition: 'C1' }),
				edge('oq', 'o', 'q', { condition: 'C2' }),
				edge('or', 'o', 'r', { condition: 'C3', isDefault: true }),
			],
		)

		it('без выбора идут все связи с условием, кроме связи по умолчанию', () => {
			expect(edgesOf(simulateTokens(graph, {}, config)?.steps)).toEqual([['ao'], ['op', 'oq']])
		})

		it('выбор списком через запятую задаёт набор связей', () => {
			expect(edgesOf(simulateTokens(graph, { o: 'C1,r' }, config)?.steps)).toEqual([['ao'], ['op', 'or']])
			expect(edgesOf(simulateTokens(graph, { o: 'C2' }, config)?.steps)).toEqual([['ao'], ['oq']])
		})

		it('выбор без совпадений и ничего с условием — одна связь как при exclusive', () => {
			expect(edgesOf(simulateTokens(graph, { o: 'нет' }, config)?.steps)).toEqual([['ao'], ['op', 'oq']])
			const noConditions = graphOf(
				[node('a'), node('o', 'or'), node('p'), node('q')],
				[edge('ao', 'a', 'o'), edge('op', 'o', 'p'), edge('oq', 'o', 'q', { isDefault: true })],
			)
			expect(edgesOf(simulateTokens(noConditions, {}, config)?.steps)).toEqual([['ao'], ['oq']])
		})

		it('inclusive join (some) ждёт токены, которые ещё идут по ветке выше, и срабатывает один раз', () => {
			const joined = graphOf(
				[node('a'), node('b'), node('c'), node('j', 'or'), node('d'), node('z')],
				[
					edge('ab', 'a', 'b'),
					edge('ac', 'a', 'c'),
					edge('bj', 'b', 'j'),
					edge('cd', 'c', 'd'),
					edge('dj', 'd', 'j'),
					edge('jz', 'j', 'z'),
				],
			)
			expect(edgesOf(simulateTokens(joined, {}, config)?.steps)).toEqual([['ab', 'ac'], ['bj', 'cd'], ['dj'], ['jz']])
		})
	})

	it('цикл обрывается на пределе 200 шагов; свой предел maxSteps режет и круг из нескольких ходов', () => {
		const loop = graphOf([node('s'), node('a'), node('b')], [edge('sa', 's', 'a'), edge('ab', 'a', 'b'), edge('ba', 'b', 'a')])
		expect(simulateTokens(loop, {}, config)?.steps).toHaveLength(200)
		expect(simulateTokens(loop, {}, { ...config, maxSteps: 3 })?.steps).toHaveLength(3)
		const fan = graphOf([node('a'), node('b'), node('c')], [edge('ab', 'a', 'b'), edge('ac', 'a', 'c')])
		const cut = simulateTokens(fan, {}, { ...config, maxSteps: 1 })
		expect(cut?.steps).toEqual([{ id: 'sim-1', edge: 'ab', label: 'B', status: undefined }])
	})

	it('follow отсекает связи, isStart задаёт старт', () => {
		const graph = graphOf([node('a'), node('b'), node('c')], [edge('ab', 'a', 'b'), edge('bc', 'b', 'c', { kind: 'note' })])
		const only = simulateTokens(graph, {}, { ...config, follow: item => item.kind !== 'note' })
		expect(edgesOf(only?.steps)).toEqual([['ab']])
		const fromB = simulateTokens(graph, {}, { ...config, isStart: item => item.id === 'b' })
		expect(edgesOf(fromB?.steps)).toEqual([['bc']])
	})

	it('связь-сигнал доходит до узла, но запускает его, только если других входов нет', () => {
		const graph = graphOf(
			[node('a'), node('b'), node('m'), node('t'), node('after'), node('u')],
			[
				edge('ab', 'a', 'b'),
				edge('msg', 'b', 'm', { kind: 'message' }),
				edge('am', 'a', 'm'),
				edge('mafter', 'm', 'after'),
				edge('bt', 'b', 't', { kind: 'message' }),
				edge('tu', 't', 'u'),
			],
		)
		const signalConfig = { ...config, isSignal: (item: { kind?: string }) => item.kind === 'message' }
		const result = simulateTokens(graph, {}, signalConfig)
		expect(edgesOf(result?.steps)).toEqual([['ab', 'am'], ['msg', 'bt', 'mafter'], ['tu']])
	})
})
