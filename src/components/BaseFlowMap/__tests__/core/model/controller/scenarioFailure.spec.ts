import { render } from '@testing-library/vue'
import { edge, map, node } from '../fixtures/flowData'
import { defineComponent, h, shallowReactive } from 'vue'
import { useFlowModel } from '../../../../model/useFlowModel'
import type { FlowModelProps } from '../../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../../types/internal/core/flowRenderInternal.types'

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

function mountWith(preloadScenario: () => Promise<unknown>) {
	let model!: FlowModelInternal
	const props = shallowReactive({ data }) as FlowModelProps
	const Host = defineComponent({
		setup() {
			model = useFlowModel(props, {
				emit: () => undefined,
				listeners: () => ({}),
				environment: { isVisible: () => true, isReducedMotion: () => true, announce: () => undefined },
				isCompact: () => false,
				preloadScenario,
			})
			return () => h('div')
		},
	})
	render(Host)
	return model
}

describe('сценарий: сбой загрузки очищает очередь', () => {
	it('play и seek, ждавшие загрузки, после сбоя пропадают: поздняя загрузка их не выполняет', async () => {
		const preload = vi.fn().mockRejectedValueOnce(new Error('сеть')).mockResolvedValue(undefined)
		const model = mountWith(preload)
		model.controller.play('s1')
		model.controller.seek({ step: 'x2' })
		await vi.waitFor(() => expect(preload).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(model.scenario.isLoaded.value).toBe(false)
		await model.scenario.load()
		expect(model.scenario.isLoaded.value).toBe(true)
		expect(model.controller.getScenarioState()).toMatchObject({ status: 'idle', stepIndex: -1 })
	})

	it('после сбоя новая команда снова ставится в очередь и выполняется при успешной загрузке', async () => {
		const preload = vi.fn().mockRejectedValueOnce(new Error('сеть')).mockResolvedValue(undefined)
		const model = mountWith(preload)
		await vi.waitFor(() => expect(preload).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		model.controller.play('s1')
		await model.scenario.load()
		expect(model.controller.getScenarioState().status).toBe('playing')
		model.controller.stop()
	})
})
