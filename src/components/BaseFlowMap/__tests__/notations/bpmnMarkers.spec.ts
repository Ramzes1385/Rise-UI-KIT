import { node } from '../helpers/flowFixtures.test-utils'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { activityMarkers, eventMarkers, gatewayMarkers } from '../../model/notations/bpmn/bpmnMarkers'
import {
	BPMN_EVENT_TRIGGERS,
	BPMN_GATEWAY_KINDS,
	BPMN_LOOP_TYPES,
	BPMN_TASK_TYPES,
	BPMN_TRIGGERS_BY_KIND,
} from '../../types/notations/process/bpmn.types'

guardConsole()

describe('знаки событий BPMN', () => {
	const markersOf = (kind: 'start' | 'intermediate' | 'end' | 'boundary', props?: Record<string, unknown>) =>
		eventMarkers(kind)(node('e', kind, { props: props as never }))

	it('без запуска знака нет; у каждого запуска свой знак по центру', () => {
		expect(markersOf('start')).toEqual([])
		expect(markersOf('start', { trigger: 'none' })).toEqual([])
		const paths = BPMN_EVENT_TRIGGERS.filter(trigger => trigger !== 'none').map(trigger => {
			const [marker] = markersOf('start', { trigger })
			expect(marker.placement).toBe('center')
			return marker.path
		})
		expect(new Set(paths).size).toBe(paths.length)
		expect(paths.every(Boolean)).toBe(true)
	})

	it('граничное событие без запуска считается сообщением, остальные — без знака', () => {
		expect(markersOf('boundary')[0].path).toBe(markersOf('boundary', { trigger: 'message' })[0].path)
		expect(markersOf('intermediate')).toEqual([])
	})

	it('заливка знака: бросающие (конец всегда, промежуточное с isThrowing) и «завершение» залиты, принимающие — нет', () => {
		expect(markersOf('end', { trigger: 'message' })[0].isFilled).toBe(true)
		expect(markersOf('intermediate', { trigger: 'message', isThrowing: true })[0].isFilled).toBe(true)
		expect(markersOf('intermediate', { trigger: 'message', isThrowing: false })[0].isFilled).toBe(false)
		expect(markersOf('intermediate', { trigger: 'message' })[0].isFilled).toBe(false)
		expect(markersOf('start', { trigger: 'message' })[0].isFilled).toBe(false)
		expect(markersOf('boundary', { trigger: 'timer' })[0].isFilled).toBe(false)
		expect(markersOf('start', { trigger: 'terminate' })[0].isFilled).toBe(true)
	})

	it('знак есть для любого допустимого запуска любого вида события', () => {
		const kinds = {
			start: 'start',
			'intermediate-catch': 'intermediate',
			'intermediate-throw': 'intermediate',
			end: 'end',
			boundary: 'boundary',
		} as const
		for (const [group, triggers] of Object.entries(BPMN_TRIGGERS_BY_KIND)) {
			const kind = kinds[group as keyof typeof kinds]
			for (const trigger of triggers.filter(item => item !== 'none')) {
				expect(markersOf(kind, { trigger, isThrowing: group === 'intermediate-throw' }), `${group}/${trigger}`).toHaveLength(1)
			}
		}
	})
})

describe('знаки шлюзов BPMN', () => {
	it('у каждого вида шлюза один знак по центру, знаки разные', () => {
		const paths = BPMN_GATEWAY_KINDS.map(kind => {
			const markers = gatewayMarkers(kind)()
			expect(markers).toHaveLength(1)
			expect(markers[0].placement).toBe('center')
			return markers[0].path
		})
		expect(new Set(paths).size).toBe(BPMN_GATEWAY_KINDS.length)
	})
})

describe('знаки действий BPMN', () => {
	const task = activityMarkers({ isTask: true, isExpandable: false })
	const sub = activityMarkers({ isTask: false, isExpandable: true })
	const props = (value: Record<string, unknown>) => node('a', 'task', { props: value as never })

	it('задача без свойств — без знаков', () => {
		expect(task(node('a', 'task'))).toEqual([])
		expect(task(props({ taskType: 'none', loop: 'none' }))).toEqual([])
	})

	it('тип задачи — знак вверху слева; «отправка» залита, остальные нет; у подпроцесса тип игнорируется', () => {
		for (const taskType of BPMN_TASK_TYPES.filter(item => item !== 'none')) {
			const [marker] = task(props({ taskType }))
			expect(marker.placement, taskType).toBe('top-start')
			expect(marker.isFilled, taskType).toBe(taskType === 'send')
		}
		expect(sub(props({ taskType: 'user' })).map(marker => marker.placement)).toEqual(['bottom-center'])
	})

	it('циклы — знак внизу слева, у каждого свой', () => {
		const paths = BPMN_LOOP_TYPES.filter(item => item !== 'none').map(loop => {
			const [marker] = task(props({ loop }))
			expect(marker.placement).toBe('bottom-start')
			return marker.path
		})
		expect(new Set(paths).size).toBe(3)
	})

	it('подпроцесс получает «плюс» внизу по центру; цикл и компенсация добавляются рядом, по порядку', () => {
		expect(sub(node('s', 'subprocess')).map(marker => marker.placement)).toEqual(['bottom-center'])
		expect(sub(props({ loop: 'standard', isCompensation: true })).map(marker => marker.placement)).toEqual([
			'bottom-center',
			'bottom-start',
			'bottom-end',
		])
	})

	it('задача с типом, циклом и компенсацией — три знака в трёх углах', () => {
		expect(task(props({ taskType: 'user', loop: 'multi-parallel', isCompensation: true })).map(marker => marker.placement)).toEqual([
			'top-start',
			'bottom-start',
			'bottom-end',
		])
	})
})
