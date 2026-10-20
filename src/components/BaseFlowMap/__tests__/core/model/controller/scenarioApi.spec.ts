import { nextTick } from 'vue'
import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import type { FlowScenarioState } from '../../../../types/data/flowScenario.types'

const data = map({
	nodes: [node('a'), node('b'), node('c')],
	edges: [edge('e1', ['a', 'b']), edge('e2', ['b', 'c'])],
	scenarios: [
		{
			id: 's1',
			label: 'Сценарий',
			steps: [
				{ id: 'x1', edge: 'e1' },
				{ id: 'x2', edge: 'e2' },
			],
		},
	],
})

describe('контроллер: события истории и сценария', () => {
	it('history-change шлётся при записи в историю и при откате', async () => {
		const { controller, eventsOf } = createHarness(data)
		await controller.addNode(node('d'))
		await nextTick()
		expect(eventsOf('history-change').at(-1)).toMatchObject({ canUndo: true, canRedo: false })
		controller.undo()
		await nextTick()
		expect(eventsOf('history-change').at(-1)).toMatchObject({ canUndo: false, canRedo: true })
	})

	it('play, pause, stop меняют состояние и шлют scenario-change', async () => {
		const { controller, eventsOf, model } = createHarness(data)
		controller.play()
		await model.scenario.load()
		await nextTick()
		expect(controller.getScenarioState()).toMatchObject({ scenario: 's1', status: 'playing', stepCount: 2 })
		expect((eventsOf('scenario-change').at(-1) as FlowScenarioState).status).toBe('playing')
		controller.pause()
		await nextTick()
		expect(controller.getScenarioState().status).toBe('paused')
		controller.stop()
		await nextTick()
		expect(controller.getScenarioState().status).toBe('idle')
	})

	it('seek, step и setSpeed доходят до сценария; смена шага шлёт scenario-step', async () => {
		const { controller, eventsOf, model } = createHarness(data)
		await model.scenario.load()
		controller.setSpeed(2)
		controller.seek({ step: 'x2' })
		await nextTick()
		expect(controller.getScenarioState().speed).toBe(2)
		expect(controller.getScenarioState().stepIndex).toBeGreaterThanOrEqual(1)
		controller.step(-1)
		await nextTick()
		controller.step(1)
		await nextTick()
		expect(eventsOf('scenario-step').length).toBeGreaterThan(0)
		controller.stop()
	})
})
