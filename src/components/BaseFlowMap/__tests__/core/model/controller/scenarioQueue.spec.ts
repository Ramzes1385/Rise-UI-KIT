import { render } from '@testing-library/vue'
import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import { useFlowModel } from '../../../../model/useFlowModel'
import type { FlowModelProps } from '../../../../types/internal/flowModel.types'
import { defineComponent, h, inject, nextTick, ref, shallowReactive } from 'vue'
import { FLOW_SCENARIO_DETAILS } from '../../../../model/scenario/scenarioContext'
import type { FlowScenarioDetails } from '../../../../types/internal/flowScenarioInternal.types'
import type { FlowModelInternal } from '../../../../types/internal/core/flowRenderInternal.types'
import { IDLE_SCENARIO_STATE, useFlowScenarioLoader } from '../../../../model/scenario/useFlowScenarioLoader'

const scenario = {
	id: 's1',
	label: 'Сценарий',
	steps: [
		{ id: 'x1', edge: 'e1' },
		{ id: 'x2', edge: 'e2' },
	],
}
const data = map({
	nodes: [node('a'), node('b'), node('c')],
	edges: [edge('e1', ['a', 'b']), edge('e2', ['b', 'c'])],
	scenarios: [scenario],
})

describe('сценарий: ленивая загрузка и очередь команд', () => {
	it('до загрузки состояние пустое, после — настоящее; load() идемпотентна', async () => {
		const { model } = createHarness(data)
		expect(model.scenario.isLoaded.value).toBe(false)
		expect(model.scenario.state.value).toBe(IDLE_SCENARIO_STATE)
		expect(model.scenario.timeline.value).toEqual([])
		await Promise.all([model.scenario.load(), model.scenario.load()])
		expect(model.scenario.isLoaded.value).toBe(true)
		expect(model.scenario.state.value).toMatchObject({ scenario: 's1', stepCount: 2, status: 'idle' })
		expect(model.scenario.timeline.value.length).toBeGreaterThan(0)
	})

	it('play до загрузки ждёт в очереди и запускается сразу после загрузки', async () => {
		const { controller, model } = createHarness(data)
		controller.play('s1')
		expect(controller.getScenarioState().status).toBe('idle')
		await model.scenario.load()
		expect(controller.getScenarioState().status).toBe('playing')
		controller.stop()
	})

	it('pause, stop, seek, step и setSpeed тоже ставятся в очередь и выполняются по порядку', async () => {
		const { controller, model } = createHarness(data)
		controller.setSpeed(2)
		controller.play('s1')
		controller.seek({ step: 'x2' })
		controller.pause()
		expect(controller.getScenarioState().status).toBe('idle')
		await model.scenario.load()
		await nextTick()
		const paused = controller.getScenarioState()
		expect(paused.status).toBe('paused')
		expect(paused.speed).toBe(2)
		expect(paused.stepIndex).toBeGreaterThanOrEqual(1)
	})

	it('stop и step в очереди: остановка после запуска возвращает покой, шаг двигает сценарий', async () => {
		const first = createHarness(data)
		first.controller.play('s1')
		first.controller.stop()
		await first.model.scenario.load()
		expect(first.controller.getScenarioState().status).toBe('idle')
		const second = createHarness(data)
		second.controller.step(1)
		await second.model.scenario.load()
		await nextTick()
		expect(second.controller.getScenarioState().stepIndex).toBeGreaterThanOrEqual(0)
	})

	it('после загрузки команды идут напрямую, очередь пуста и не выполняется повторно', async () => {
		const { controller, model } = createHarness(data)
		controller.play('s1')
		await model.scenario.load()
		controller.pause()
		expect(controller.getScenarioState().status).toBe('paused')
		controller.stop()
		expect(controller.getScenarioState().status).toBe('idle')
	})

	it('команда без сценариев в данных сама запускает загрузку кода и не роняет вызов', async () => {
		const { controller, model } = createHarness(map({ nodes: [node('a')], edges: [] }))
		expect(model.scenario.isLoaded.value).toBe(false)
		expect(() => controller.play()).not.toThrow()
		await model.scenario.load()
		expect(model.scenario.isLoaded.value).toBe(true)
		expect(controller.getScenarioState().status).toBe('idle')
	})

	it('без сценария и симуляции код сценария не грузится сам', async () => {
		const { model } = createHarness(map({ nodes: [node('a')], edges: [] }))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(model.scenario.isLoaded.value).toBe(false)
	})
})

describe('сценарий: загрузчик вне компонента', () => {
	it('без компонента подробности не раздаются, состояние пустое и ничего не грузится без нужды', () => {
		const model = { data: ref(map()), notation: ref({}) }
		const props = {}
		const loader = useFlowScenarioLoader(model as never, props as never, {
			environment: { isVisible: () => true, isReducedMotion: () => true, announce: () => undefined },
		})
		expect(loader.isLoaded.value).toBe(false)
		expect(loader.state.value).toBe(IDLE_SCENARIO_STATE)
		expect(loader.timeline.value).toEqual([])
	})
})

describe('сценарий: подробности для панели до и после загрузки', () => {
	function mountDetails() {
		let model!: FlowModelInternal
		let details!: FlowScenarioDetails
		const props = shallowReactive({ data }) as FlowModelProps
		const Child = defineComponent({
			setup() {
				details = inject(FLOW_SCENARIO_DETAILS) as FlowScenarioDetails
				return () => h('div')
			},
		})
		const Host = defineComponent({
			setup() {
				model = useFlowModel(props, {
					emit: () => undefined,
					listeners: () => ({}),
					environment: { isVisible: () => true, isReducedMotion: () => true, announce: () => undefined },
					isCompact: () => false,
				})
				return () => h(Child)
			},
		})
		render(Host)
		return { model, details }
	}

	it('до загрузки подробности пусты, запись и выбор ничего не ломают', () => {
		const { details } = mountDetails()
		expect(details.scenario.value).toBeNull()
		expect(details.scenarios.value).toEqual([])
		expect(details.actions.value.size).toBe(0)
		expect(details.choices.value).toEqual({})
		expect(details.isSimulated.value).toBe(false)
		expect(details.isSilent.value).toBe(false)
		details.isSilent.value = true
		expect(details.isSilent.value).toBe(false)
		expect(() => details.select('s1')).not.toThrow()
	})

	it('после загрузки подробности читают и пишут настоящий драйвер', async () => {
		const { model, details } = mountDetails()
		await model.scenario.load()
		expect(details.scenarios.value.map(item => item.id)).toEqual(['s1'])
		expect(details.scenario.value?.id).toBe('s1')
		details.isSilent.value = true
		expect(details.isSilent.value).toBe(true)
		expect(() => details.select('s1')).not.toThrow()
	})
})
