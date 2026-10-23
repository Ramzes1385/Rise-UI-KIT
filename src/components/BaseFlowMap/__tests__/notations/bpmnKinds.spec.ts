import { UI_FLOW_BPMN } from '@/locales/messages'
import { flowBpmn } from '../../model/notations/bpmn'
import { node } from '../helpers/flowFixtures.test-utils'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { BPMN_EDGE_KINDS, BPMN_GROUP_KINDS, BPMN_NODE_KINDS } from '../../model/notations/bpmn/bpmnKinds'
import { compensationProp, loopProp, taskTypeProp, throwingProp, triggerLabel, triggerProp } from '../../model/notations/bpmn/bpmnLabels'
import {
	BPMN_ACTIVITY_KINDS,
	BPMN_EVENT_KINDS,
	BPMN_EVENT_TRIGGERS,
	BPMN_GATEWAY_KINDS,
	BPMN_LOOP_TYPES,
	BPMN_TASK_TYPES,
	BPMN_TRIGGERS_BY_KIND,
} from '../../types/notations/process/bpmn.types'

guardConsole()

const labelsOf = (def?: { options?: { value: string; label: () => string }[] }) => def?.options?.map(option => option.value)

describe('нотация BPMN: описание', () => {
	it('id, стандарт, названия по умолчанию, раскладка, правила и обход токена', () => {
		expect(flowBpmn).toMatchObject({
			id: 'bpmn',
			standard: 'OMG BPMN 2.0.2 · ISO/IEC 19510:2013',
			defaultNodeKind: 'task',
			defaultEdgeKind: 'sequence',
			layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
		})
		expect(flowBpmn.label()).toBe(UI_FLOW_BPMN.NAME)
		expect(flowBpmn.rulesSummary?.()).toBe(UI_FLOW_BPMN.RULES_SUMMARY)
		expect(flowBpmn.rules?.canConnect).toBeTypeOf('function')
		expect(flowBpmn.semantics?.simulate).toBeTypeOf('function')
		expect(Object.keys(flowBpmn.semantics?.gateways ?? {}).sort()).toEqual([...BPMN_GATEWAY_KINDS].sort())
	})
})

describe('нотация BPMN: виды узлов', () => {
	it('набор видов: события, действия, шлюзы, данные и примечание', () => {
		expect(Object.keys(BPMN_NODE_KINDS).sort()).toEqual(
			[...BPMN_EVENT_KINDS, ...BPMN_ACTIVITY_KINDS, ...BPMN_GATEWAY_KINDS, 'data-object', 'data-store', 'annotation'].sort(),
		)
	})

	it('у каждого вида есть название, размер, SVG-отрисовка и группа палитры', () => {
		for (const [id, def] of Object.entries(BPMN_NODE_KINDS)) {
			expect(def.label(), id).not.toBe('')
			expect(def.render, id).toBe('svg')
			expect(def.size.width, id).toBeGreaterThan(0)
			expect(def.paletteGroup, id).toMatch(/^(events|activities|gateways|data)$/)
		}
	})

	it.each([
		['start', 'single', 'var(--rise-success)'],
		['intermediate', 'double', 'var(--rise-info)'],
		['end', 'thick', 'var(--rise-text)'],
		['boundary', 'double', 'var(--rise-info)'],
	])('событие «%s»: кольцо %s, круг, подпись снизу', (id, ring, stroke) => {
		expect(BPMN_NODE_KINDS[id]).toMatchObject({
			shape: { shape: 'circle', ring, stroke },
			labelPlacement: 'below',
			paletteGroup: 'events',
			size: { width: 36, height: 36 },
		})
	})

	it('шлюзы — ромбы; событийный с двойным кольцом, знак по центру берётся из вида', () => {
		for (const id of BPMN_GATEWAY_KINDS) {
			const shape = BPMN_NODE_KINDS[id].shape
			expect(shape.shape, id).toBe('diamond')
			expect(shape.ring, id).toBe(id === 'event-based' ? 'double' : 'single')
			expect(shape.markers?.(node('g', id)), id).toHaveLength(1)
			expect(BPMN_NODE_KINDS[id].paletteGroup).toBe('gateways')
		}
	})

	it('действия: задача — не контейнер, подпроцесс и транзакция — контейнеры; кольца и размеры', () => {
		expect(BPMN_NODE_KINDS.task).toMatchObject({
			size: { width: 144, height: 56 },
			labelPlacement: 'inside',
			shape: { ring: 'single' },
		})
		expect(BPMN_NODE_KINDS.task.isContainer).toBeUndefined()
		expect(BPMN_NODE_KINDS.subprocess).toMatchObject({ isContainer: true, size: { width: 168, height: 96 } })
		expect(BPMN_NODE_KINDS['call-activity'].shape.ring).toBe('thick')
		expect(BPMN_NODE_KINDS.transaction).toMatchObject({ isContainer: true, shape: { ring: 'double' } })
	})

	it('свойства действий: тип задачи только у задачи; цикл и компенсация — у всех действий', () => {
		expect(Object.keys(BPMN_NODE_KINDS.task.props ?? {})).toEqual(['taskType', 'loop', 'isCompensation'])
		for (const id of ['subprocess', 'call-activity', 'transaction']) {
			expect(Object.keys(BPMN_NODE_KINDS[id].props ?? {}), id).toEqual(['loop', 'isCompensation'])
		}
	})

	it('свойства событий: запуск — только допустимые для вида; у промежуточного ещё «бросающее»', () => {
		const expected = {
			start: BPMN_TRIGGERS_BY_KIND.start,
			intermediate: BPMN_TRIGGERS_BY_KIND['intermediate-catch'],
			end: BPMN_TRIGGERS_BY_KIND.end,
			boundary: BPMN_TRIGGERS_BY_KIND.boundary,
		}
		for (const [id, triggers] of Object.entries(expected)) {
			const trigger = BPMN_NODE_KINDS[id].props?.trigger
			expect(labelsOf(trigger), id).toEqual([...triggers])
			expect(trigger?.default, id).toBe(id === 'boundary' ? 'message' : 'none')
		}
		expect(Object.keys(BPMN_NODE_KINDS.intermediate.props ?? {})).toEqual(['trigger', 'isThrowing'])
		expect(Object.keys(BPMN_NODE_KINDS.start.props ?? {})).toEqual(['trigger'])
	})

	it('данные и примечание: фигуры «документ», «цилиндр» и «открытая рамка»', () => {
		expect(BPMN_NODE_KINDS['data-object'].shape.shape).toBe('document')
		expect(BPMN_NODE_KINDS['data-store'].shape.shape).toBe('cylinder')
		expect(BPMN_NODE_KINDS.annotation).toMatchObject({ shape: { shape: 'open-rect' }, labelPlacement: 'inside', paletteGroup: 'data' })
	})
})

describe('нотация BPMN: связи и группы', () => {
	it('виды связей: поток, сообщение, ассоциация, ассоциация данных', () => {
		expect(Object.keys(BPMN_EDGE_KINDS)).toEqual(['sequence', 'message', 'association', 'data-association'])
		expect(BPMN_EDGE_KINDS.sequence).toMatchObject({ stroke: 'solid', endMarker: 'arrow', startMarker: 'none', effect: 'travel' })
		expect(BPMN_EDGE_KINDS.message).toMatchObject({
			stroke: 'dashed',
			startMarker: 'circle',
			endMarker: 'open-arrow',
			effect: 'travel',
		})
		expect(BPMN_EDGE_KINDS.association).toMatchObject({ stroke: 'dotted', endMarker: 'none', routing: 'straight', effect: 'draw' })
		expect(BPMN_EDGE_KINDS['data-association']).toMatchObject({ stroke: 'dotted', endMarker: 'open-arrow', effect: 'draw' })
		expect(Object.values(BPMN_EDGE_KINDS).map(def => def.label())).toEqual([
			UI_FLOW_BPMN.EDGE_SEQUENCE,
			UI_FLOW_BPMN.EDGE_MESSAGE,
			UI_FLOW_BPMN.EDGE_ASSOCIATION,
			UI_FLOW_BPMN.EDGE_DATA_ASSOCIATION,
		])
	})

	it('группы: пул и дорожка — полосы, группа — пунктирная рамка', () => {
		expect(BPMN_GROUP_KINDS.pool).toMatchObject({ layout: 'band', header: 'start', border: 'solid' })
		expect(BPMN_GROUP_KINDS.lane).toMatchObject({ layout: 'band', header: 'start', border: 'solid' })
		expect(BPMN_GROUP_KINDS.group).toMatchObject({ layout: 'box', header: 'top', border: 'dashed' })
		expect(BPMN_GROUP_KINDS.pool.label()).toBe(UI_FLOW_BPMN.GROUP_POOL)
		expect(BPMN_GROUP_KINDS.lane.label()).toBe(UI_FLOW_BPMN.GROUP_LANE)
		expect(BPMN_GROUP_KINDS.group.label()).toBe(UI_FLOW_BPMN.GROUP_GROUP)
	})
})

describe('нотация BPMN: подписи и свойства', () => {
	it('у каждого запуска есть непустая подпись, у разных запусков подписи разные', () => {
		const labels = BPMN_EVENT_TRIGGERS.map(trigger => triggerLabel(trigger))
		expect(labels.every(Boolean)).toBe(true)
		expect(new Set(labels).size).toBe(labels.length)
	})

	it('свойства-значки: выбор запуска, типа задачи, цикла и два флажка', () => {
		const trigger = triggerProp(['none', 'timer'], 'timer')
		expect(trigger).toMatchObject({ type: 'select', default: 'timer' })
		expect(trigger.label()).toBe(UI_FLOW_BPMN.PROP_TRIGGER)
		expect(trigger.options?.map(option => option.label())).toEqual([triggerLabel('none'), triggerLabel('timer')])
		const taskType = taskTypeProp(BPMN_TASK_TYPES)
		expect(taskType).toMatchObject({ type: 'select', default: 'none' })
		expect(taskType.label()).toBe(UI_FLOW_BPMN.PROP_TASK_TYPE)
		expect(taskType.options?.map(option => option.label()).every(Boolean)).toBe(true)
		expect(labelsOf(taskType)).toEqual([...BPMN_TASK_TYPES])
		const loop = loopProp(BPMN_LOOP_TYPES)
		expect(loop.label()).toBe(UI_FLOW_BPMN.PROP_LOOP)
		expect(labelsOf(loop)).toEqual([...BPMN_LOOP_TYPES])
		expect(loop.options?.map(option => option.label()).every(Boolean)).toBe(true)
		expect(throwingProp()).toMatchObject({ type: 'boolean', default: false })
		expect(throwingProp().label()).toBe(UI_FLOW_BPMN.PROP_THROWING)
		expect(compensationProp()).toMatchObject({ type: 'boolean', default: false })
		expect(compensationProp().label()).toBe(UI_FLOW_BPMN.PROP_COMPENSATION)
	})
})
