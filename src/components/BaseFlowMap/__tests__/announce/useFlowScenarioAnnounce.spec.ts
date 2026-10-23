import { vi } from 'vitest'
import { formatMessage } from '@/locales/state'
import { defineComponent, nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowMapData } from '../../types/data/flowData.types'
import { useFlowMapContext } from '../../model/context/flowContext'
import { act, edge, node } from '../helpers/flowFixtures.test-utils'
import type { FlowScenario } from '../../types/data/flowScenario.types'
import { mountInMap, type MapHarness } from '../helpers/mapHarness.test-utils'
import { installFakeFrames, type FakeFrames } from '../helpers/fakeFrames.test-utils'
import { useFlowScenarioAnnounce } from '../../model/scenario/announce/useFlowScenarioAnnounce'

guardConsole()

const Probe = defineComponent({
	setup() {
		useFlowScenarioAnnounce(useFlowMapContext())
		return () => null
	},
})

const checkout: FlowScenario = {
	id: 'checkout',
	label: 'Оформление',
	steps: [act('a', { edge: 'e1', label: 'POST /orders', latency: 18, duration: 1000 }), act('b', { edge: 'e2', duration: 1000 })],
}

function mapOf(scenario: FlowScenario): FlowMapData {
	return {
		version: 1,
		nodes: [node('web'), node('api'), node('db')],
		edges: [edge('e1', 'web', 'api'), edge('e2', 'api', 'db')],
		scenarios: [scenario],
	}
}

let frames: FakeFrames
let harness: MapHarness | null = null

function mountProbe(scenario: FlowScenario = checkout, props: MapHarness['props'] extends infer P ? Partial<P> : never = {}): MapHarness {
	harness = mountInMap({ data: mapOf(scenario), child: Probe, props })
	return harness
}

beforeEach(() => {
	frames = installFakeFrames()
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
	harness?.wrapper.unmount()
	harness = null
	vi.useRealTimers()
	frames.restore()
})

async function play(total: number, step = 100): Promise<void> {
	for (let spent = 0; spent < total; spent += step) {
		frames.frame(step)
		await nextTick()
	}
}

const stepText = (n: number, total: number, text: string) => formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_STEP, { n, total, text })

describe('озвучка сценария', () => {
	it('при проигрывании каждый шаг озвучивается сразу: номер, всего, откуда → куда, подпись, задержка', async () => {
		const { driver, announce } = mountProbe()
		driver.play()
		frames.frame(16)
		await vi.advanceTimersByTimeAsync(0)
		expect(announce).toHaveBeenNthCalledWith(1, stepText(1, 2, `WEB → API, POST /orders, 18 ${UI_FLOW_SCENARIO.UNIT_MS}`))
		await play(1100)
		await vi.advanceTimersByTimeAsync(0)
		expect(announce).toHaveBeenCalledWith(stepText(2, 2, 'API → DB'))
	})

	it('в конце сценария итог звучит через 250 мс: своё резюме сценария', async () => {
		const { driver, announce } = mountProbe({ ...checkout, summary: '≈ 1 с от клика до письма' })
		driver.play()
		frames.frame(16)
		await play(2400)
		await vi.advanceTimersByTimeAsync(250)
		expect(announce).toHaveBeenLastCalledWith(formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_DONE, { summary: '≈ 1 с от клика до письма' }))
	})

	it('итог без резюме — сумма задержек; без задержек — простая фраза', async () => {
		const withLatency = mountProbe()
		withLatency.driver.play()
		frames.frame(16)
		await play(2400)
		await vi.advanceTimersByTimeAsync(250)
		const total = formatMessage(UI_FLOW_SCENARIO.TOTAL, { value: `18 ${UI_FLOW_SCENARIO.UNIT_MS}` })
		expect(withLatency.announce).toHaveBeenLastCalledWith(formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_DONE, { summary: total }))
		withLatency.wrapper.unmount()
		const plain = mountProbe({ id: 'p', label: 'P', steps: [act('x', { edge: 'e1', duration: 500 })] })
		plain.driver.play()
		frames.frame(16)
		await play(1000)
		await vi.advanceTimersByTimeAsync(250)
		expect(plain.announce).toHaveBeenLastCalledWith(UI_FLOW_SCENARIO.ANNOUNCE_DONE_PLAIN)
	})

	it('параллельные шаги озвучиваются одной фразой через «;»', async () => {
		const parallel: FlowScenario = {
			id: 'par',
			label: 'Параллельно',
			steps: [
				{
					type: 'parallel',
					id: 'p',
					branches: [[act('x', { edge: 'e1', duration: 500 })], [act('y', { edge: 'e2', duration: 500 })]],
				},
			],
		}
		const { driver, announce } = mountProbe(parallel)
		driver.play()
		frames.frame(16)
		await vi.advanceTimersByTimeAsync(0)
		expect(announce).toHaveBeenCalledWith(formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_PARALLEL, { text: 'WEB → API; API → DB' }))
	})

	it('шаг без описания озвучивается без текста', async () => {
		const { driver, announce, details } = mountProbe({ id: 'g', label: 'G', steps: [act('x', { duration: 500 })] })
		expect(details.actions.value.has('x')).toBe(true)
		driver.play()
		frames.frame(16)
		await vi.advanceTimersByTimeAsync(0)
		expect(announce).toHaveBeenCalledWith(stepText(1, 1, ''))
	})

	it('перемотка и шаги вручную: фраза уходит с задержкой 250 мс, быстрые правки склеиваются в последнюю', async () => {
		const { driver, announce } = mountProbe()
		driver.step(1)
		await vi.advanceTimersByTimeAsync(100)
		driver.step(1)
		await vi.advanceTimersByTimeAsync(249)
		expect(announce).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		expect(announce).toHaveBeenCalledTimes(1)
		expect(announce).toHaveBeenCalledWith(stepText(2, 2, 'API → DB'))
	})

	it('итог при перемотке в конец — тоже с задержкой', async () => {
		const { driver, announce } = mountProbe()
		driver.seek({ step: 'b' })
		await vi.advanceTimersByTimeAsync(250)
		announce.mockClear()
		driver.seek(99999)
		expect(announce).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(250)
		expect(announce).toHaveBeenCalledTimes(1)
	})

	it('автозапуск молчит; первое действие пользователя возвращает озвучку', async () => {
		const { driver, announce } = mountProbe(checkout, { isAutoplay: true })
		frames.frame(16)
		frames.frame(100)
		await vi.advanceTimersByTimeAsync(300)
		expect(announce).not.toHaveBeenCalled()
		driver.pause()
		driver.step(1)
		await vi.advanceTimersByTimeAsync(300)
		expect(announce).toHaveBeenCalledTimes(1)
	})

	it('конец сценария, к которому пришли из idle (пустой), не озвучивается', async () => {
		const { driver, announce } = mountProbe({ id: 'empty', label: 'E', steps: [] })
		driver.play()
		await vi.advanceTimersByTimeAsync(300)
		expect(announce).not.toHaveBeenCalled()
	})

	it('остановка в начале (idle) ничего не озвучивает; размонтирование отменяет ожидающую фразу', async () => {
		const { driver, announce, wrapper } = mountProbe()
		driver.step(1)
		wrapper.unmount()
		await vi.advanceTimersByTimeAsync(500)
		expect(announce).not.toHaveBeenCalled()
		harness = null
	})
})
