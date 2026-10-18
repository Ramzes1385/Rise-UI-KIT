import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { screen } from '@testing-library/vue'
import { formatMessage } from '@/locales/state'
import { defineComponent, nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { useFlowMapContext } from '../../model/context/flowContext'
import FlowScenarioLayer from '../../ui/scenario/FlowScenarioLayer.vue'
import FlowScenarioPanel from '../../ui/scenario/FlowScenarioPanel.vue'
import { mountBare, type BareHarness } from '../helpers/mapHarness.test-utils'
import { useFlowScenarioPanel } from '../../model/scenario/panel/useFlowScenarioPanel'
import type { FlowScenarioPanelView } from '../../types/internal/flowScenarioLayer.types'
import { useFlowScenarioAnnounce } from '../../model/scenario/announce/useFlowScenarioAnnounce'

guardConsole()

let harness: BareHarness | undefined

afterEach(() => {
	harness?.wrapper.unmount()
	harness = undefined
	vi.useRealTimers()
})

const Probe = defineComponent({
	setup() {
		useFlowScenarioAnnounce(useFlowMapContext())
		return () => null
	},
})

describe('части сценария без драйвера подробностей', () => {
	it('модель панели без подробностей: пустые значения вместо ошибок', () => {
		let view!: FlowScenarioPanelView
		harness = mountBare(
			defineComponent({
				setup() {
					view = useFlowScenarioPanel()
					return () => null
				},
			}),
		)
		expect(view.scenario.value).toBeNull()
		expect(view.scenarios.value).toEqual([])
		expect(view.steps.value).toEqual([])
		expect(view.isSimulated.value).toBe(false)
		expect(view.summary.value).toBe('')
		expect(view.stepText.value).toBe(UI_FLOW_SCENARIO.READY)
		view.select('x')
	})

	it('панель без подробностей сценария показывает «сценариев нет»', () => {
		harness = mountBare(FlowScenarioPanel)
		expect(screen.getByText(UI_FLOW_SCENARIO.NONE)).toBeInTheDocument()
	})

	it('слой без подробностей рисует только частицы, без отметок', () => {
		harness = mountBare(FlowScenarioLayer, { status: 'playing' })
		expect(document.querySelectorAll('.base-flow-map__scenario-trail')).toHaveLength(0)
	})

	it('озвучка без подробностей: шаг без текста, итог — простая фраза, обе озвучены сразу при проигрывании', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		harness = mountBare(Probe, { status: 'playing', stepIndex: 0, stepCount: 2 })
		harness.state.value = { ...harness.state.value, activeSteps: ['x'] }
		await nextTick()
		expect(harness.announce).toHaveBeenCalledWith(formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_STEP, { n: 1, total: 2, text: '' }))
		harness.state.value = { ...harness.state.value, status: 'ended', activeSteps: [] }
		await nextTick()
		await vi.advanceTimersByTimeAsync(250)
		expect(harness.announce).toHaveBeenLastCalledWith(UI_FLOW_SCENARIO.ANNOUNCE_DONE_PLAIN)
	})
})
