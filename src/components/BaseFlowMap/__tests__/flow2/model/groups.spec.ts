import { createHarness } from '../fixtures/flow2Harness'
import { pluralize, formatMessage } from '@/locales/state'
import { UI_FLOW_MAP, UI_PLURAL } from '@/locales/messages'
import { indexGroups } from '../../../model/groups/tree/groupTree'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FlowViewAdapter } from '../../../types/internal/flowModel.types'
import { collapseFlowData, FLOW_COLLAPSED_KIND } from '../../../model/groups/tree/collapseData'
import { edge, group, map, node, plainZoomNotation, tree, zoomNotation } from '../fixtures/flow2Data'

const items = (count: number) => pluralize(UI_PLURAL.FLOW_ITEMS, count)
const links = (count: number) => pluralize(UI_PLURAL.FLOW_LINKS, count)

function open(data = tree(), props = {}) {
	return createHarness(data, { notations: [zoomNotation, plainZoomNotation], ...props })
}

function stubView() {
	const view: FlowViewAdapter = {
		fitView: vi.fn(),
		focus: vi.fn(),
		zoom: vi.fn(),
		getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
		setViewport: vi.fn(),
		exportSvg: vi.fn(),
		exportPng: vi.fn(),
	}
	return view
}

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('сворачивание: блок вместо группы', () => {
	it('на крупном плане группа верхнего уровня — один блок с числом элементов и данными группы', () => {
		const { model } = open(
			tree({
				groups: [
					group('g1', { label: 'Шлюз', color: '#abc', kind: 'zone', props: { tech: 'k8s' } }),
					group('g2', { parent: 'g1' }),
				],
			}),
		)
		const shown = model.shown.value
		expect(shown.nodes.map(item => item.id)).toEqual(['d', 'g1'])
		const block = shown.nodes[1]
		expect(block).toMatchObject({ kind: FLOW_COLLAPSED_KIND, label: 'Шлюз', subtitle: items(3) })
		expect(block.props).toEqual({ isCollapsedGroup: true, count: 3, color: '#abc', groupKind: 'zone', groupProps: { tech: 'k8s' } })
		expect(shown.groups).toEqual([])
	})

	it('блок без цвета и свойств группы получает пустые значения', () => {
		const { model } = open()
		expect(model.shown.value.nodes[1].props).toMatchObject({ color: '', groupProps: {} })
	})

	it('позиция и размер группы переходят к блоку, если заданы целиком', () => {
		const data = tree({
			groups: [
				group('g1', { position: { x: 5, y: 6 }, size: { width: 300, height: 200 } }),
				group('g2', { parent: 'g1', size: { width: 10 } }),
			],
		})
		const { model } = open(data)
		expect(model.shown.value.nodes[1]).toMatchObject({ position: { x: 5, y: 6 }, size: { width: 300, height: 200 } })
		model.controller.setLevel(1)
		const sizeless = model.shown.value.nodes.find(item => item.id === 'g2')
		expect(sizeless?.size).toBeUndefined()
		expect(sizeless?.position).toBeUndefined()
	})

	it('связи внутри блока исчезают, связи наружу сливаются в одну с числом связей и без портов', () => {
		const { model } = open()
		const shown = model.shown.value.edges
		expect(shown.map(item => item.id)).toEqual(['collapsed:g1>d'])
		expect(shown[0]).toMatchObject({ source: 'g1', target: 'd', label: links(3) })
		expect(shown[0].sourcePort).toBeUndefined()
	})

	it('одиночная связь к блоку сохраняет id, подпись и убирает порт', () => {
		const { model } = open()
		model.controller.setLevel(1)
		const byId = Object.fromEntries(model.shown.value.edges.map(item => [item.id, item]))
		expect(byId.e2).toMatchObject({ source: 'a', target: 'g2', label: 'два' })
		expect(byId.e4).toMatchObject({ source: 'g2', target: 'd' })
		expect(byId.e1.source).toBe('a')
		expect(byId.e3.sourcePort).toBe('x')
		expect(model.shown.value.groups?.map(item => item.id)).toEqual(['g1'])
	})

	it('на последнем уровне данные не меняются: shown совпадает с data', () => {
		const { model } = open()
		model.controller.setLevel(2)
		expect(model.shown.value).toBe(model.data.value)
		expect(model.controller.getCollapsed()).toEqual([])
	})

	it('вложенная свёрнутая группа не даёт второго блока, пока свёрнут её родитель', () => {
		const { model } = open()
		expect(model.controller.getCollapsed().sort()).toEqual(['g1', 'g2'])
		expect(model.shown.value.nodes.filter(item => item.kind === FLOW_COLLAPSED_KIND)).toHaveLength(1)
	})

	it('карта без групп не меняется при свёрнутом наборе', () => {
		const { model } = open(map({ notation: 'zoomy', nodes: [node('a')], edges: [edge('e', ['a', 'a'])] }))
		expect(model.shown.value.nodes.map(item => item.id)).toEqual(['a'])
		expect(model.shown.value.groups).toBeUndefined()
	})

	it('группа с isCollapsed в данных свёрнута и без смыслового зума', () => {
		const data = tree({ notation: undefined, groups: [group('g1', { isCollapsed: true }), group('g2', { parent: 'g1' })] })
		const { model } = open(data, { isSemanticZoom: false })
		expect(model.controller.getCollapsed()).toEqual(['g1'])
		expect(model.controller.getLevel()).toMatchObject({ count: 0, labels: [], label: '' })
	})
})

describe('сворачивание: явные переключения', () => {
	it('toggleGroup разворачивает и сворачивает группу, а уровень и путь не меняются', async () => {
		const { model, controller, eventsOf } = open()
		controller.toggleGroup('g1', false)
		await vi.advanceTimersByTimeAsync(0)
		expect(controller.getCollapsed()).toEqual(['g2'])
		expect(model.shown.value.nodes.map(item => item.id)).toEqual(['a', 'b', 'd', 'g2'])
		expect(eventsOf('group-toggle')).toEqual([{ target: { entity: 'group', id: 'g1' } }])
		expect(eventsOf('level-change')).toEqual([])
		controller.toggleGroup('g1')
		await vi.advanceTimersByTimeAsync(0)
		expect(controller.getCollapsed().sort()).toEqual(['g1', 'g2'])
		expect(eventsOf('group-toggle')).toHaveLength(2)
	})

	it('неизвестная группа и повторное то же состояние игнорируются', async () => {
		const { controller, eventsOf } = open()
		controller.toggleGroup('нет', true)
		controller.toggleGroup('g1', true)
		await vi.advanceTimersByTimeAsync(0)
		expect(eventsOf('group-toggle')).toEqual([])
	})

	it('сворачивание — не данные: нет update:data, change и записи в историю', async () => {
		const { controller, eventsOf, model } = open()
		controller.toggleGroup('g1', false)
		controller.toggleGroup('g2', false)
		await vi.advanceTimersByTimeAsync(0)
		expect(eventsOf('update:data')).toEqual([])
		expect(eventsOf('change')).toEqual([])
		expect(eventsOf('history-change')).toEqual([])
		expect(model.data.value.groups?.every(item => !item.isCollapsed)).toBe(true)
	})

	it('событие group-toggle приходит на каждую группу, у которой изменилось состояние', async () => {
		const { controller, eventsOf } = open()
		controller.setLevel(2)
		await vi.advanceTimersByTimeAsync(0)
		expect(eventsOf('group-toggle')).toEqual([{ target: { entity: 'group', id: 'g1' } }, { target: { entity: 'group', id: 'g2' } }])
	})

	it('явное переключение сбрасывается при смене уровня', () => {
		const { model, controller } = open()
		controller.toggleGroup('g1', false)
		controller.setLevel(1)
		expect(model.controller.getCollapsed()).toEqual(['g2'])
		controller.toggleGroup('g2', false)
		expect(controller.getCollapsed()).toEqual([])
		controller.setLevel(1)
		expect(controller.getCollapsed()).toEqual(['g2'])
	})
})

describe('сворачивание: скрытый узел', () => {
	it('select скрытого узла разворачивает все группы на пути к нему', () => {
		const { controller } = open()
		controller.select(['c'])
		expect(controller.getCollapsed()).toEqual([])
		expect(controller.getSelection()).toEqual(['c'])
	})

	it('focus скрытого узла разворачивает путь и передаёт вид', () => {
		const { controller, model } = open()
		const view = stubView()
		model.setView(view)
		controller.focus('b')
		expect(controller.getCollapsed()).toEqual(['g2'])
		expect(view.focus).toHaveBeenCalledWith('b', undefined)
	})

	it('select скрытой группы раскрывает только её родителей', () => {
		const { controller } = open()
		controller.select(['g2'])
		expect(controller.getCollapsed()).toEqual(['g2'])
	})

	it('select видимого и неизвестного id ничего не раскрывает', () => {
		const { controller } = open()
		controller.select(['d', 'нет'])
		expect(controller.getCollapsed().sort()).toEqual(['g1', 'g2'])
	})
})

describe('уровни: состояние и подписи', () => {
	it('подписи уровней берутся из нотации, последний — из semanticZoomLabel', () => {
		const { controller } = open()
		expect(controller.getLevel()).toEqual({
			index: 0,
			count: 3,
			label: 'Контекст',
			labels: ['Контекст', 'Контейнеры', 'Компоненты'],
			path: [],
		})
	})

	it('без подписей в нотации уровни называются «Уровень N» из словаря', () => {
		const { controller } = open(tree({ notation: 'zoomy-plain' }))
		const fallback = (n: number) => formatMessage(UI_FLOW_MAP.LEVEL_NAME, { n })
		expect(controller.getLevel().labels).toEqual([fallback(1), fallback(2)])
	})

	it('setLevel зажимает номер в границы и возвращает масштаб в нужное окно', () => {
		const { controller, model } = open()
		const view = stubView()
		model.setView(view)
		controller.setLevel(99)
		expect(controller.getLevel().index).toBe(2)
		expect(view.zoom).toHaveBeenLastCalledWith(1.2)
		controller.setLevel(-3)
		expect(controller.getLevel().index).toBe(0)
		expect((view.zoom as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]).toBeCloseTo(Math.sqrt(0.2 * 0.5))
		controller.setLevel(1)
		expect(controller.getLevel().index).toBe(1)
		expect((view.zoom as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]).toBeCloseTo(Math.sqrt(0.5 * 1))
	})

	it('setLevel без смыслового зума ничего не делает', () => {
		const { controller, model } = open(tree({ notation: undefined }))
		const view = stubView()
		model.setView(view)
		controller.setLevel(1)
		expect(view.zoom).not.toHaveBeenCalled()
		expect(controller.getLevel().count).toBe(0)
	})

	it('isSemanticZoom=false отключает уровни и включается обратно без повторного закрепления', async () => {
		const { controller, props } = open(tree(), { isSemanticZoom: false })
		expect(controller.getLevel().count).toBe(0)
		props.isSemanticZoom = true
		expect(controller.getLevel().count).toBe(3)
		expect(controller.getLevel().index).toBe(0)
		controller.setLevel(1)
		props.isSemanticZoom = false
		props.isSemanticZoom = true
		expect(controller.getLevel().index).toBe(1)
	})

	it('level-change приходит при смене уровня', async () => {
		const { controller, eventsOf } = open()
		controller.setLevel(2)
		await vi.advanceTimersByTimeAsync(0)
		expect(eventsOf('level-change')).toHaveLength(1)
		expect(eventsOf('level-change')[0]).toMatchObject({ index: 2 })
	})
})

describe('уровни: масштаб, дребезг и закрепление', () => {
	it('первый масштаб запоминается, закрепление держится первые 700 мс при любом масштабе', () => {
		const { model } = open()
		model.groups.setZoom(2)
		model.groups.setZoom(0.1)
		expect(model.groups.level.value.index).toBe(0)
	})

	it('после 700 мс малое изменение масштаба не снимает закрепление', () => {
		const { model } = open()
		model.groups.setZoom(2)
		vi.advanceTimersByTime(800)
		model.groups.setZoom(2.1)
		expect(model.groups.level.value.index).toBe(0)
	})

	it('после 700 мс заметный сдвиг (>8 %) снимает закрепление, уровень идёт за масштабом', () => {
		const { model } = open()
		model.groups.setZoom(2)
		vi.advanceTimersByTime(800)
		model.groups.setZoom(3)
		expect(model.groups.level.value.index).toBe(2)
		model.groups.setZoom(0.3)
		expect(model.groups.level.value.index).toBe(0)
		model.groups.setZoom(0.7)
		expect(model.groups.level.value.index).toBe(1)
	})

	it('явный setLevel закрепляет уровень и перезапускает окно 700 мс', () => {
		const { model, controller } = open()
		controller.setLevel(1)
		model.groups.setZoom(5)
		model.groups.setZoom(0.1)
		expect(model.groups.level.value.index).toBe(1)
		vi.advanceTimersByTime(800)
		model.groups.setZoom(0.105)
		expect(model.groups.level.value.index).toBe(1)
		model.groups.setZoom(0.2)
		expect(model.groups.level.value.index).toBe(0)
	})

	it('смена уровня масштабом сбрасывает явные переключения', () => {
		const { model, controller } = open()
		controller.toggleGroup('g1', false)
		model.groups.setZoom(1.5)
		vi.advanceTimersByTime(800)
		model.groups.setZoom(3)
		expect(controller.getCollapsed()).toEqual([])
	})
})

describe('уровни: повторный setLevel и морф', () => {
	it('isMorphing включается при смене набора свёрнутых и гаснет через 360 мс', async () => {
		const { model, controller } = open()
		expect(model.groups.isMorphing.value).toBe(false)
		controller.setLevel(2)
		controller.setLevel(1)
		expect(model.groups.isMorphing.value).toBe(true)
		vi.advanceTimersByTime(359)
		expect(model.groups.isMorphing.value).toBe(true)
		vi.advanceTimersByTime(2)
		expect(model.groups.isMorphing.value).toBe(false)
	})

	it('тот же набор свёрнутых не запускает морф', () => {
		const { model, controller } = open()
		controller.setLevel(0)
		expect(model.groups.isMorphing.value).toBe(false)
	})
})

describe('вход в группу и выход', () => {
	it('enterGroup разворачивает цепочку, выбирает уровень по глубине, кладёт путь и вписывает группу', () => {
		const { controller, model } = open()
		const view = stubView()
		model.setView(view)
		controller.enterGroup('g2')
		expect(controller.getLevel().path).toEqual(['g1', 'g2'])
		expect(controller.getLevel().index).toBe(2)
		expect(controller.getCollapsed()).toEqual([])
		expect(view.fitView).toHaveBeenLastCalledWith({ ids: ['g2'], isAnimated: true })
	})

	it('enterGroup верхней группы оставляет вложенную свёрнутой', () => {
		const { controller, model } = open()
		const view = stubView()
		model.setView(view)
		controller.enterGroup('g1', { isAnimated: false })
		expect(controller.getLevel()).toMatchObject({ path: ['g1'], index: 1 })
		expect(controller.getCollapsed()).toEqual(['g2'])
		expect(view.fitView).toHaveBeenLastCalledWith({ ids: ['g1'], isAnimated: false })
	})

	it('enterGroup неизвестной группы не меняет состояние', () => {
		const { controller } = open()
		controller.enterGroup('нет')
		expect(controller.getLevel()).toMatchObject({ path: [], index: 0 })
	})

	it('enterGroup без смыслового зума только разворачивает и ведёт путь', () => {
		const { controller } = open(tree({ notation: undefined }), { isSemanticZoom: false })
		controller.toggleGroup('g1', true)
		controller.enterGroup('g2')
		expect(controller.getLevel()).toMatchObject({ path: ['g1', 'g2'], count: 0 })
		expect(controller.getCollapsed()).toEqual([])
	})

	it('leaveGroup по умолчанию выходит на шаг выше, с глубиной — на нужную, 0 — к корню', () => {
		const { controller, model } = open()
		const view = stubView()
		model.setView(view)
		controller.enterGroup('g2')
		controller.leaveGroup()
		expect(controller.getLevel()).toMatchObject({ path: ['g1'], index: 1 })
		expect(view.fitView).toHaveBeenLastCalledWith({ ids: ['g1'], isAnimated: true })
		controller.enterGroup('g2')
		controller.leaveGroup(0, { isAnimated: false })
		expect(controller.getLevel()).toMatchObject({ path: [], index: 0 })
		expect(view.fitView).toHaveBeenLastCalledWith({ ids: undefined, isAnimated: false })
	})

	it('leaveGroup дальше длины пути зажимается по длине', () => {
		const { controller } = open()
		controller.enterGroup('g1')
		controller.leaveGroup(10)
		expect(controller.getLevel().path).toEqual(['g1'])
		controller.leaveGroup()
		controller.leaveGroup()
		expect(controller.getLevel().path).toEqual([])
	})

	it('leaveGroup без смыслового зума только укорачивает путь', () => {
		const { controller } = open(tree({ notation: undefined }), { isSemanticZoom: false })
		controller.enterGroup('g2')
		controller.leaveGroup()
		expect(controller.getLevel().path).toEqual(['g1'])
	})

	it('путь обрывается на свёрнутой или удалённой группе', () => {
		const { controller, props } = open()
		controller.enterGroup('g2')
		controller.toggleGroup('g2', true)
		expect(controller.getLevel().path).toEqual(['g1'])
		controller.toggleGroup('g2', false)
		props.data = tree({ groups: [group('g1', { label: 'Шлюз' })], nodes: [node('a', { group: 'g1' }), node('d')], edges: [] })
		expect(controller.getLevel().path).toEqual(['g1'])
	})

	it('level-change приходит и при смене пути входа', async () => {
		const { controller, eventsOf } = open()
		controller.enterGroup('g1')
		await vi.advanceTimersByTimeAsync(0)
		expect(eventsOf('level-change')).toHaveLength(1)
		expect(eventsOf('level-change')[0]).toMatchObject({ path: ['g1'] })
	})

	it('setLevel сохраняет текущий путь входа как след', () => {
		const { controller } = open()
		controller.enterGroup('g2')
		controller.setLevel(2)
		expect(controller.getLevel().path).toEqual(['g1', 'g2'])
	})
})

describe('чистые функции групп', () => {
	it('indexGroups и collapseFlowData терпят данные без групп', () => {
		expect(indexGroups(undefined).size).toBe(0)
		const data = map({ nodes: [node('a')], edges: [] })
		const result = collapseFlowData(data, new Set(['g']), { items: items, links: links })
		expect(result.groups).toBeUndefined()
		expect(result.nodes.map(item => item.id)).toEqual(['a'])
	})

	it('setLevel без смыслового зума возвращает текущий масштаб', () => {
		const { model } = open(tree({ notation: undefined }))
		expect(model.groups.setLevel(5, { min: 0.2, max: 3 })).toBe(1)
	})

	it('пустая свёрнутая группа даёт блок с нулём элементов', () => {
		const data = tree({ groups: [group('g1'), group('g2', { parent: 'g1' }), group('empty')] })
		const { model } = open(data)
		expect(model.shown.value.nodes.find(item => item.id === 'empty')).toMatchObject({ subtitle: items(0), props: { count: 0 } })
	})

	it('select при развёрнутых группах ничего не меняет', () => {
		const { controller } = open()
		controller.setLevel(2)
		controller.select(['c'])
		expect(controller.getCollapsed()).toEqual([])
	})
})

describe('вид по умолчанию: пустая карта', () => {
	it('без групп смысловой зум не ломается', () => {
		const { controller } = open(map({ notation: 'zoomy', nodes: [node('a')] }))
		expect(controller.getCollapsed()).toEqual([])
		controller.setLevel(1)
		controller.leaveGroup()
		expect(controller.getLevel().path).toEqual([])
	})
})
