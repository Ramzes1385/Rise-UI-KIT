import { describe, expect, it } from 'vitest'
import { UI_FLOW_C4 } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { createHarness } from '../../fixtures/flow2Harness'
import { c4Legend } from '../../../../model/notations/c4/c4Rules'
import { edge, group, map, node } from '../../fixtures/flow2Data'
import { flowC4, c4CardLine } from '../../../../model/notations/c4'
import { c4CollapsedKind } from '../../../../model/notations/c4/c4Kinds'
import { C4_ZOOM_LEVELS } from '../../../../model/notations/c4/c4Levels'
import type { FlowMapData } from '../../../../types/data/flowData.types'
import { c4BlockLine, c4KindOf } from '../../../../model/notations/c4/c4Card'
import { hasOverlaps, isInside, issuesOf, layoutOf, verdictOf } from '../../fixtures/notationKit'

const c4 = (id: string, kind: string, extra = {}) => node(id, { kind, ...extra })

function data(parts: Partial<FlowMapData>): FlowMapData {
	return map({ notation: 'c4', ...parts })
}

describe('C4: виды и подписи', () => {
	it('шесть видов узлов, связь relationship, три границы; подписи непустые', () => {
		expect(Object.keys(flowC4.nodeKinds)).toEqual([
			'person',
			'software-system',
			'container',
			'component',
			'external-person',
			'external-system',
			'collapsed-group',
		])
		expect(Object.keys(flowC4.groupKinds ?? {})).toEqual(['enterprise-boundary', 'system-boundary', 'container-boundary'])
		for (const kind of [
			...Object.values(flowC4.nodeKinds),
			...Object.values(flowC4.edgeKinds),
			...Object.values(flowC4.groupKinds ?? {}),
		]) {
			expect(kind.label()).not.toBe('')
		}
		expect(flowC4.nodeKinds.container.props?.technology.label()).toBe(UI_FLOW_C4.PROP_TECHNOLOGY)
		expect(flowC4.nodeKinds['external-system'].isExternal).toBe(true)
		expect(flowC4.rulesSummary?.()).toBe(UI_FLOW_C4.RULES_SUMMARY)
		expect(flowC4.label()).toBe(UI_FLOW_C4.NOTATION)
	})

	it('уровни c4Levels: контекст, контейнеры, последний — компоненты', () => {
		expect(C4_ZOOM_LEVELS.map(level => [level.minZoom, level.depth, level.label?.()])).toEqual([
			[0.45, 0, UI_FLOW_C4.LEVEL_CONTEXT],
			[0.85, 1, UI_FLOW_C4.LEVEL_CONTAINERS],
		])
		expect(flowC4.semanticZoomLabel?.()).toBe(UI_FLOW_C4.LEVEL_COMPONENTS)
		expect(flowC4.semanticZoom).toBe(C4_ZOOM_LEVELS)
	})

	it('блок свёрнутой группы: подпись снизу, пунктирное кольцо, контейнер', () => {
		expect(c4CollapsedKind).toMatchObject({ labelPlacement: 'bottom-start', isContainer: true, shape: { ring: 'dashed' } })
		expect(c4CollapsedKind.label()).not.toBe('')
		expect(c4CollapsedKind.subtitle).toBe(c4BlockLine)
	})
})

describe('C4: строка карточки и блока', () => {
	it('c4CardLine: вид и технология, без технологии — только вид', () => {
		const withTech = c4CardLine(c4('a', 'container', { props: { technology: 'Go' } }))
		expect(withTech).toBe(formatMessage(UI_FLOW_C4.CARD_LINE, { kind: UI_FLOW_C4.CONTAINER, technology: 'Go' }))
		expect(c4CardLine(c4('a', 'c4:person'))).toBe(formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.PERSON }))
		expect(c4CardLine(c4('a', 'container', { props: { technology: '' } }))).toBe(
			formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.CONTAINER }),
		)
		expect(c4CardLine(c4('a', 'container', { props: { technology: 5 } }))).toBe(
			formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.CONTAINER }),
		)
		expect(c4CardLine(c4('a', 'неизвестный'))).toBe(formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: '' }))
		expect(c4KindOf({ kind: 'c4:component' })).toBe('component')
	})

	const block = (groupKind: unknown, groupProps?: unknown, extra = {}) =>
		c4('b', 'collapsed-group', { props: { groupKind, groupProps }, ...extra })

	it('c4BlockLine: system-boundary — «Программная система», container-boundary с технологией, enterprise-boundary', () => {
		expect(c4BlockLine(block('system-boundary'))).toBe(formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.SOFTWARE_SYSTEM }))
		expect(c4BlockLine(block('container-boundary', { technology: 'Kafka' }))).toBe(
			formatMessage(UI_FLOW_C4.CARD_LINE, { kind: UI_FLOW_C4.CONTAINER, technology: 'Kafka' }),
		)
		expect(c4BlockLine(block('enterprise-boundary'))).toBe(
			formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.ENTERPRISE_BOUNDARY }),
		)
	})

	it('c4BlockLine: технология игнорируется, если это не непустая строка или groupProps не объект', () => {
		const plain = formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.CONTAINER })
		expect(c4BlockLine(block('container-boundary', { technology: 7 }))).toBe(plain)
		expect(c4BlockLine(block('container-boundary', { technology: '' }))).toBe(plain)
		expect(c4BlockLine(block('container-boundary', ['Kafka']))).toBe(plain)
		expect(c4BlockLine(block('container-boundary', 'Kafka'))).toBe(plain)
		expect(c4BlockLine(block('container-boundary', null))).toBe(plain)
		expect(c4BlockLine(block('container-boundary'))).toBe(plain)
	})

	it('c4BlockLine: неизвестный вид группы — запасной подзаголовок узла или пустая строка', () => {
		expect(c4BlockLine(block('zone', undefined, { subtitle: '3 элемента' }))).toBe('3 элемента')
		expect(c4BlockLine(block(42))).toBe('')
		expect(c4BlockLine(c4('b', 'collapsed-group'))).toBe('')
	})
})

describe('C4: правила', () => {
	const canContain = flowC4.rules?.canContain as NonNullable<NonNullable<typeof flowC4.rules>['canContain']>
	const boundary = (kind: string) => group('g', { kind, label: 'Граница' })

	it('система-граница вмещает контейнеры, но не компоненты и не людей — c4-contain с перечнем разрешённого', () => {
		expect(canContain(boundary('system-boundary'), c4('a', 'container'))).toBe(true)
		const denied = canContain(boundary('system-boundary'), c4('a', 'component'))
		expect(denied).toMatchObject({ code: 'c4-contain' })
		expect((denied as { message: string }).message).toContain('Граница')
		expect((denied as { message: string }).message).toContain(UI_FLOW_C4.CONTAINER)
	})

	it('граница контейнера — только компоненты, граница предприятия — люди и системы', () => {
		expect(canContain(boundary('container-boundary'), c4('a', 'component'))).toBe(true)
		expect(canContain(boundary('container-boundary'), c4('a', 'container'))).toMatchObject({ code: 'c4-contain' })
		expect(canContain(boundary('c4:enterprise-boundary'), c4('a', 'person'))).toBe(true)
		expect(canContain(boundary('enterprise-boundary'), c4('a', 'external-system'))).toBe(true)
		expect(canContain(boundary('enterprise-boundary'), c4('a', 'container'))).toMatchObject({ code: 'c4-contain' })
	})

	it('без подписи у группы в причине — её id; чужая группа и отсутствие группы не ограничены', () => {
		const unnamed = canContain(group('gid', { kind: 'system-boundary', label: '' }), c4('a', 'person')) as { message: string }
		expect(unnamed.message).toContain('gid')
		expect(canContain(group('z', { kind: 'zone' }), c4('a', 'person'))).toBe(true)
		expect(canContain(null, c4('a', 'person'))).toBe(true)
	})

	it('связи relationship — между любыми видами', () => {
		const sample = data({ nodes: [c4('a', 'person'), c4('b', 'external-system')] })
		expect(verdictOf(flowC4, sample, ['a', 'b'])).toBeUndefined()
		expect(flowC4.rules?.connections?.[0]).toMatchObject({ edge: 'relationship' })
	})

	it('связь без подписи — предупреждение c4-relationship-label с названиями концов', () => {
		const sample = data({
			nodes: [c4('a', 'person', { label: 'Клиент' }), c4('b', 'software-system', { label: 'Магазин' }), c4('c', 'person')],
			edges: [
				edge('e1', ['a', 'b']),
				edge('e2', ['a', 'b'], { label: '  ' }),
				edge('e3', ['a', 'b'], { label: 'Покупает' }),
				edge('e4', ['c', 'нет']),
				edge('e5', ['нет', 'c']),
			],
		})
		const issues = issuesOf(flowC4, sample)
		expect(issues.map(item => item.target?.id)).toEqual(['e1', 'e2', 'e4', 'e5'])
		expect(issues[0]).toMatchObject({ level: 'warning', code: 'c4-relationship-label' })
		expect(issues[0].message).toContain('Клиент')
		expect(issues[0].message).toContain('Магазин')
		expect(issues[2].message).toContain('нет')
		expect(issues[3].message).toContain('нет')
	})

	it('вынос узла в чужую границу у пользователя отклоняется правилом', async () => {
		const sample = data({ groups: [group('sys', { kind: 'system-boundary' })], nodes: [c4('a', 'container', { group: 'sys' })] })
		const { controller } = createHarness(sample, { notations: [flowC4] })
		const added = await controller.addNode(c4('b', 'person', { group: 'sys' }))
		expect(added.reject).toMatchObject({ by: 'rule', code: 'c4-contain' })
	})
})

describe('C4: легенда', () => {
	it('только использованные виды в порядке нотации плюс связь', () => {
		const items = c4Legend(data({ nodes: [c4('a', 'component'), c4('b', 'c4:person'), c4('c', 'component')] }))
		expect(items.map(item => item.id)).toEqual(['node-person', 'node-component', 'edge-relationship'])
		expect(items[0]).toMatchObject({ label: UI_FLOW_C4.PERSON, sample: { entity: 'node', kind: 'person' } })
		expect(items.at(-1)).toMatchObject({ label: UI_FLOW_C4.RELATIONSHIP, sample: { entity: 'edge', kind: 'relationship' } })
	})

	it('пустая карта — одна строка о связи', () => {
		expect(c4Legend(data({})).map(item => item.id)).toEqual(['edge-relationship'])
	})
})

describe('C4: раскладка c4-nested', () => {
	const nested = data({
		groups: [group('ent', { kind: 'enterprise-boundary' }), group('sys', { kind: 'system-boundary', parent: 'ent' })],
		nodes: [
			c4('p', 'person'),
			c4('s1', 'software-system', { group: 'ent' }),
			c4('c1', 'container', { group: 'sys' }),
			c4('c2', 'container', { group: 'sys' }),
			c4('x', 'external-system'),
		],
		edges: [edge('e1', ['p', 'c1'], { label: 'a' }), edge('e2', ['c1', 'c2'], { label: 'b' }), edge('e3', ['c2', 'x'], { label: 'c' })],
	})

	it('границы вкладываются, узлы лежат внутри своих границ, наложений нет', () => {
		const { nodes, groups } = layoutOf(flowC4, nested)
		expect(isInside(groups.sys, groups.ent)).toBe(true)
		expect(isInside(nodes.c1, groups.sys)).toBe(true)
		expect(isInside(nodes.c2, groups.sys)).toBe(true)
		expect(isInside(nodes.s1, groups.ent)).toBe(true)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('направление всегда сверху вниз, даже если в данных задано другое', () => {
		const forced = layoutOf(flowC4, nested, { direction: 'LR' })
		const base = layoutOf(flowC4, nested, { direction: 'TB' })
		expect(forced).toEqual(base)
		expect(base.nodes.c1.y).toBeLessThan(base.nodes.c2.y)
	})

	it('детерминизм, 0/1/2 элемента и закреплённый узел', () => {
		expect(layoutOf(flowC4, nested)).toEqual(layoutOf(flowC4, nested))
		expect(layoutOf(flowC4, data({})).nodes).toEqual({})
		expect(Object.keys(layoutOf(flowC4, data({ nodes: [c4('a', 'person')] })).nodes)).toEqual(['a'])
		const two = layoutOf(
			flowC4,
			data({ nodes: [c4('a', 'person'), c4('b', 'software-system')], edges: [edge('e', ['a', 'b'], { label: 'x' })] }),
		)
		expect(two.nodes.b.y).toBeGreaterThan(two.nodes.a.y)
		const pinned = layoutOf(
			flowC4,
			data({ nodes: [c4('a', 'person', { position: { x: 400, y: 400 }, isPinned: true }), c4('b', 'person')] }),
			{ gridSize: 8 },
		)
		expect(pinned.nodes.a).toMatchObject({ x: 400, y: 400 })
	})
})
