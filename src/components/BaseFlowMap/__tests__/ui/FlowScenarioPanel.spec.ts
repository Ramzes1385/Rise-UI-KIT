import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { BaseText } from '@components/BaseText'
import userEvent from '@testing-library/user-event'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { BaseTooltip } from '@components/BaseTooltip'
import { screen, within } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowMapData } from '../../types/data/flowData.types'
import { act, edge, node } from '../helpers/flowFixtures.test-utils'
import type { FlowScenario } from '../../types/data/flowScenario.types'
import FlowScenarioPanel from '../../ui/scenario/FlowScenarioPanel.vue'
import { installFakeFrames, type FakeFrames } from '../helpers/fakeFrames.test-utils'
import { mountInMap, type MapHarness, type MapOptions } from '../helpers/mapHarness.test-utils'

guardConsole()

const checkout: FlowScenario = {
	id: 'checkout',
	label: 'Оформление заказа',
	steps: [
		act('a', { edge: 'e1', label: 'POST /orders', via: 'HTTPS', latency: 18, duration: 1000 }),
		act('b', { edge: 'e2', label: 'резерв', latency: 40, duration: 1000, status: 'error' }),
		act('c', { node: 'db', duration: 1000 }),
	],
}
const refund: FlowScenario = { id: 'refund', label: 'Возврат', steps: [act('r', { edge: 'e1', duration: 800 })] }

function mapOf(scenarios: FlowScenario[] = [checkout]): FlowMapData {
	return {
		version: 1,
		nodes: [node('web'), node('api'), node('db')],
		edges: [edge('e1', 'web', 'api'), edge('e2', 'api', 'db')],
		scenarios,
	}
}

let frames: FakeFrames
let harness: MapHarness | undefined

function mountPanel(options: Partial<MapOptions> = {}): MapHarness {
	harness = mountInMap({ data: mapOf(), child: FlowScenarioPanel, global: { components: { BaseText, BaseTooltip } }, ...options })
	return harness
}

const panel = () => screen.getByLabelText(UI_FLOW_SCENARIO.PANEL, { selector: 'section' })
const button = (name: string) => screen.getByRole('button', { name })

beforeEach(() => {
	frames = installFakeFrames()
})

afterEach(() => {
	harness?.wrapper.unmount()
	harness = undefined
	frames.restore()
})

describe('FlowScenarioPanel: десктопная панель', () => {
	it('область «Сценарий» с названием сценария, списком шагов и подсказкой состояния', () => {
		mountPanel()
		expect(screen.getByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
		expect(screen.getByText('Оформление заказа')).toBeInTheDocument()
		expect(screen.getByText(UI_FLOW_SCENARIO.READY)).toBeInTheDocument()
		expect(within(screen.getByRole('list', { name: UI_FLOW_SCENARIO.STEPS })).getAllByRole('button')).toHaveLength(3)
		expect(panel()).toHaveAttribute('data-status', 'idle')
	})

	it('шаги: заголовок «откуда → куда», подробности, задержка; ошибка — словом', () => {
		mountPanel()
		const steps = within(screen.getByRole('list', { name: UI_FLOW_SCENARIO.STEPS })).getAllByRole('button')
		expect(steps[0]).toHaveTextContent('WEB → API')
		expect(steps[0]).toHaveTextContent('POST /orders · HTTPS')
		expect(steps[0]).toHaveTextContent(`18 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(steps[1]).toHaveTextContent(UI_FLOW_SCENARIO.FAILED)
		expect(steps[0]).not.toHaveTextContent(UI_FLOW_SCENARIO.FAILED)
		expect(steps[2]).toHaveTextContent('DB')
	})

	it('резюме — сумма задержек; своё резюме сценария важнее', () => {
		mountPanel()
		expect(screen.getByText(formatMessage(UI_FLOW_SCENARIO.TOTAL, { value: `58 ${UI_FLOW_SCENARIO.UNIT_MS}` }))).toBeInTheDocument()
		harness?.wrapper.unmount()
		mountPanel({ data: mapOf([{ ...checkout, summary: '≈ 1 с от клика до письма' }]) })
		expect(screen.getByText('≈ 1 с от клика до письма')).toBeInTheDocument()
	})

	it('«Запустить» → идёт, кнопка становится «Пауза», по нажатию — пауза; с клавиатуры тоже', async () => {
		const { driver } = mountPanel()
		const user = userEvent.setup()
		await user.click(button(UI_FLOW_SCENARIO.PLAY))
		expect(driver.state.value.status).toBe('playing')
		expect(button(UI_FLOW_SCENARIO.PAUSE)).toBeInTheDocument()
		expect(panel()).toHaveAttribute('data-status', 'playing')
		button(UI_FLOW_SCENARIO.PAUSE).focus()
		await user.keyboard('{Enter}')
		expect(driver.state.value.status).toBe('paused')
		expect(button(UI_FLOW_SCENARIO.PLAY)).toBeInTheDocument()
	})

	it('«Сначала» останавливает и запускает заново', async () => {
		const { driver } = mountPanel()
		const user = userEvent.setup()
		driver.seek({ step: 'c' })
		await nextTick()
		await user.click(button(UI_FLOW_SCENARIO.RESTART))
		expect(driver.state.value).toMatchObject({ status: 'playing', time: 0 })
	})

	it('клик по шагу перематывает на его начало; текущий шаг помечен aria-current, пройденные — галочкой', async () => {
		const { driver } = mountPanel()
		const user = userEvent.setup()
		const steps = () => within(screen.getByRole('list', { name: UI_FLOW_SCENARIO.STEPS })).getAllByRole('button')
		await user.click(steps()[1])
		expect(driver.state.value).toMatchObject({ time: 1000, status: 'paused' })
		expect(steps()[1]).toHaveAttribute('aria-current', 'step')
		expect(steps()[0]).not.toHaveAttribute('aria-current')
		expect(steps()[0].querySelector('svg, .base-icon')).not.toBeNull()
		expect(screen.getByText(formatMessage(UI_FLOW_SCENARIO.STEP_OF, { n: 2, total: 3 }))).toBeInTheDocument()
	})

	it('кнопки «шаг назад» и «шаг вперёд»', async () => {
		const { driver } = mountPanel()
		const user = userEvent.setup()
		await user.click(button(UI_FLOW_SCENARIO.STEP_FORWARD))
		await user.click(button(UI_FLOW_SCENARIO.STEP_FORWARD))
		expect(driver.state.value).toMatchObject({ time: 1000, status: 'paused' })
		await user.click(button(UI_FLOW_SCENARIO.STEP_BACK))
		expect(driver.state.value.time).toBe(0)
	})

	it('кнопка скорости переключает 1× → 2× → 0,5× → 1×', async () => {
		mountPanel()
		const user = userEvent.setup()
		const speed = () => screen.getByRole('button', { name: UI_FLOW_SCENARIO.SPEED })
		expect(speed()).toHaveTextContent(formatMessage(UI_FLOW_SCENARIO.SPEED_VALUE, { n: '1' }))
		await user.click(speed())
		expect(speed()).toHaveTextContent(formatMessage(UI_FLOW_SCENARIO.SPEED_VALUE, { n: '2' }))
		await user.click(speed())
		expect(speed()).toHaveTextContent(/0[,.]5/)
		await user.click(speed())
		expect(speed()).toHaveTextContent(formatMessage(UI_FLOW_SCENARIO.SPEED_VALUE, { n: '1' }))
	})

	it('ползунок времени перематывает с клавиатуры', async () => {
		const { driver } = mountPanel()
		const user = userEvent.setup()
		const slider = screen.getByRole('slider', { name: UI_FLOW_SCENARIO.SEEK })
		expect(slider).toHaveAttribute('aria-valuemax', '3000')
		slider.focus()
		await user.keyboard('{ArrowRight}')
		expect(driver.state.value.time).toBe(15)
		expect(driver.state.value.status).toBe('paused')
	})

	it('в конце — «Сценарий пройден»', async () => {
		const { driver } = mountPanel()
		driver.seek(99999)
		await nextTick()
		expect(screen.getByText(UI_FLOW_SCENARIO.DONE)).toBeInTheDocument()
		expect(panel()).toHaveAttribute('data-status', 'ended')
	})

	it('при двух сценариях — выбор: нажатый помечен aria-pressed, клик переключает', async () => {
		const { driver } = mountPanel({ data: mapOf([checkout, refund]) })
		const user = userEvent.setup()
		const group = screen.getByRole('group', { name: UI_FLOW_SCENARIO.SELECT })
		expect(within(group).getByRole('button', { name: 'Оформление заказа' })).toHaveAttribute('aria-pressed', 'true')
		expect(within(group).getByRole('button', { name: 'Возврат' })).toHaveAttribute('aria-pressed', 'false')
		await user.click(within(group).getByRole('button', { name: 'Возврат' }))
		expect(driver.state.value.scenario).toBe('refund')
		expect(within(group).getByRole('button', { name: 'Возврат' })).toHaveAttribute('aria-pressed', 'true')
	})

	it('при одном сценарии выбора нет', () => {
		mountPanel()
		expect(screen.queryByRole('group', { name: UI_FLOW_SCENARIO.SELECT })).toBeNull()
	})

	it('сценарий, построенный по схеме, помечен', () => {
		mountPanel({
			data: mapOf([]),
			notation: { semantics: { simulate: () => ({ id: 'sim', label: 'Обход', steps: [act('s', { edge: 'e1', duration: 500 })] }) } },
		})
		expect(screen.getByText(UI_FLOW_SCENARIO.SIMULATED)).toBeInTheDocument()
		expect(screen.getByText('Обход')).toBeInTheDocument()
	})

	it('нет сценариев — панель ничего не рисует', () => {
		mountPanel({ data: mapOf([]) })
		expect(screen.queryByRole('region')).toBeNull()
		expect(screen.queryByRole('button')).toBeNull()
	})

	it('пока сценарий без длительности, ползунок недоступен', () => {
		mountPanel({ data: mapOf([{ id: 'empty', label: 'Пусто', steps: [] }]) })
		expect(screen.getByRole('slider', { name: UI_FLOW_SCENARIO.SEEK })).toHaveAttribute('aria-disabled', 'true')
	})
})

describe('FlowScenarioPanel: компактный плеер', () => {
	it('группа «Сценарий», кнопка запуска и «шаг вперёд»; остальных элементов нет', () => {
		mountPanel({ isCompact: true })
		expect(screen.getByRole('group', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
		expect(screen.queryByRole('region')).toBeNull()
		expect(button(UI_FLOW_SCENARIO.PLAY)).toBeInTheDocument()
		expect(button(UI_FLOW_SCENARIO.STEP_FORWARD)).toBeInTheDocument()
		expect(screen.queryByRole('slider')).toBeNull()
		expect(screen.queryByRole('list')).toBeNull()
		expect(panel()).toHaveClass('base-flow-map__scenario-panel--compact')
	})

	it('запуск, текущий шаг и пауза', async () => {
		const { driver } = mountPanel({ isCompact: true })
		const user = userEvent.setup()
		await user.click(button(UI_FLOW_SCENARIO.PLAY))
		frames.frame(16)
		frames.frame(100)
		await nextTick()
		expect(screen.getByText(formatMessage(UI_FLOW_SCENARIO.STEP_OF, { n: 1, total: 3 }))).toBeInTheDocument()
		expect(screen.getByText('WEB → API')).toBeInTheDocument()
		await user.click(button(UI_FLOW_SCENARIO.PAUSE))
		expect(driver.state.value.status).toBe('paused')
		await user.click(button(UI_FLOW_SCENARIO.STEP_FORWARD))
		expect(driver.state.value.time).toBe(1000)
	})

	it('компактный вид включается на лету', async () => {
		const { refs } = mountPanel()
		expect(screen.queryByRole('group', { name: UI_FLOW_SCENARIO.PANEL })).toBeNull()
		refs.isCompact.value = true
		await nextTick()
		expect(screen.getByRole('group', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
	})

	it('нет сценариев — ничего не рисуется и в компактном виде', () => {
		mountPanel({ isCompact: true, data: mapOf([]) })
		expect(screen.queryByRole('region')).toBeNull()
		expect(screen.queryByRole('button')).toBeNull()
	})
})
