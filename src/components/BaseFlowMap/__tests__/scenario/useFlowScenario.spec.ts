import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowMapData } from '../../types/data/flowData.types'
import { act, edge, node } from '../helpers/flowFixtures.test-utils'
import { mountOutside } from '../helpers/scenarioHarness.test-utils'
import { mountScenario } from '../helpers/scenarioHarness.test-utils'
import type { FlowScenario } from '../../types/data/flowScenario.types'
import { installFakeFrames, type FakeFrames } from '../helpers/fakeFrames.test-utils'

const checkout: FlowScenario = {
	id: 'checkout',
	label: 'Оформление',
	steps: [act('a', { edge: 'e1', duration: 1000 }), act('b', { edge: 'e2', duration: 1000 })],
}

const refund: FlowScenario = { id: 'refund', label: 'Возврат', steps: [act('r', { node: 'n1', duration: 500 })] }

function mapOf(scenarios: FlowScenario[] = [checkout]): FlowMapData {
	return {
		version: 1,
		nodes: [node('n1'), node('n2'), node('n3')],
		edges: [edge('e1', 'n1', 'n2'), edge('e2', 'n2', 'n3')],
		scenarios,
	}
}

let frames: FakeFrames

beforeEach(() => {
	frames = installFakeFrames()
})

afterEach(() => {
	frames.restore()
})

const guard = guardConsole()

describe('useFlowScenario: проигрывание', () => {
	it('до запуска сценарий выбран, но стоит: idle, шаги и хронометраж готовы', () => {
		const { driver, details } = mountScenario({ data: mapOf() })
		expect(driver.state.value).toMatchObject({
			scenario: 'checkout',
			status: 'idle',
			time: 0,
			duration: 2000,
			stepIndex: -1,
			stepCount: 2,
		})
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['a', 'b'])
		expect(details.isSimulated.value).toBe(false)
		expect(details.scenarios.value).toHaveLength(1)
		expect(frames.pending()).toBe(0)
	})

	it('play запускает часы: первый кадр только запоминает время, дальше время идёт, в конце — ended и часы останавливаются', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		expect(driver.state.value.status).toBe('playing')
		frames.frame(16)
		expect(driver.state.value.time).toBe(0)
		frames.frame(50)
		expect(driver.state.value.time).toBe(50)
		expect(driver.state.value.activeSteps).toEqual(['a'])
		frames.run(3000, 50)
		expect(driver.state.value).toMatchObject({ status: 'ended', time: 2000, stepIndex: 1 })
		expect(frames.pending()).toBe(0)
	})

	it('повторный play во время проигрывания ничего не меняет', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.run(160, 16)
		const before = driver.state.value.time
		driver.play()
		expect(driver.state.value.time).toBe(before)
		expect(frames.pending()).toBe(1)
	})

	it('play без сценариев и без нотации с обходом не делает ничего', () => {
		const { driver, details } = mountScenario({ data: mapOf([]) })
		expect(details.actions.value.size).toBe(0)
		driver.play()
		expect(driver.state.value.status).toBe('idle')
		expect(details.scenario.value).toBeNull()
		expect(driver.state.value.scenario).toBeNull()
	})

	it('пауза останавливает время, play продолжает с того же места', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.run(160, 16)
		driver.pause()
		const paused = driver.state.value.time
		expect(driver.state.value.status).toBe('paused')
		expect(frames.pending()).toBe(0)
		frames.run(200, 16)
		expect(driver.state.value.time).toBe(paused)
		driver.play()
		expect(driver.state.value.status).toBe('playing')
		frames.run(160, 16)
		expect(driver.state.value.time).toBeGreaterThan(paused)
	})

	it('пауза вне проигрывания не меняет состояние', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.pause()
		expect(driver.state.value.status).toBe('idle')
	})

	it('stop возвращает в начало', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.run(320, 16)
		driver.stop()
		expect(driver.state.value).toMatchObject({ status: 'idle', time: 0, doneSteps: [], activeSteps: [] })
		expect(frames.pending()).toBe(0)
	})

	it('play после ended начинает заново', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.run(3000, 50)
		expect(driver.state.value.status).toBe('ended')
		driver.play()
		expect(driver.state.value).toMatchObject({ status: 'playing', time: 0 })
	})

	it('скорость ускоряет и замедляет ход, выходящее за пределы зажимается', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.setSpeed(2)
		driver.play()
		frames.frame(16)
		frames.frame(50)
		expect(driver.state.value.time).toBe(100)
		expect(driver.state.value.speed).toBe(2)
		driver.setSpeed(99)
		expect(driver.state.value.speed).toBe(4)
		driver.setSpeed(0)
		expect(driver.state.value.speed).toBe(0.25)
	})

	it('кадр после долгого простоя режется до 100 мс', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.frame(16)
		frames.frame(60000)
		expect(driver.state.value.time).toBe(100)
	})

	it('пока карта не видна (вкладка скрыта), время стоит, цикл кадров жив', () => {
		const { driver, environment } = mountScenario({ data: mapOf() })
		driver.play()
		frames.frame(16)
		environment.visible = false
		frames.run(320, 16)
		expect(driver.state.value.time).toBe(0)
		expect(frames.pending()).toBe(1)
		environment.visible = true
		frames.frame(16)
		frames.frame(32)
		expect(driver.state.value.time).toBe(48)
	})

	it('сценарий с isLoop по окончании идёт заново и не заканчивается', () => {
		const { driver } = mountScenario({ data: mapOf([{ ...checkout, isLoop: true }]) })
		driver.play()
		frames.frame(16)
		frames.run(2500, 50)
		expect(driver.state.value.status).toBe('playing')
		expect(driver.state.value.time).toBeLessThan(2000)
	})

	it('сценарий без длительности сразу заканчивается', () => {
		const { driver } = mountScenario({ data: mapOf([{ id: 'empty', label: 'Пусто', steps: [] }]) })
		driver.play()
		expect(driver.state.value.status).toBe('ended')
		expect(frames.pending()).toBe(0)
	})

	it('запоздавший кадр после паузы ничего не двигает и не заказывает новый', () => {
		frames.restore()
		frames = installFakeFrames({ ignoreCancel: true })
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.frame(16)
		driver.pause()
		frames.frame(16)
		expect(driver.state.value.time).toBe(0)
		expect(frames.pending()).toBe(0)
	})

	it('команды в одном кадре (перемотка в конец и обратно, затем play) не запускают часы дважды', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		driver.seek(99999)
		driver.seek(500)
		driver.play()
		expect(driver.state.value.status).toBe('playing')
		expect(frames.pending()).toBe(1)
	})

	it('размонтирование останавливает часы', () => {
		const { driver, unmount } = mountScenario({ data: mapOf() })
		driver.play()
		expect(frames.pending()).toBe(1)
		unmount()
		expect(frames.pending()).toBe(0)
	})
})

describe('useFlowScenario: перемотка и шаги', () => {
	it('seek по времени из idle ставит паузу, время зажимается', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.seek(1500)
		expect(driver.state.value).toMatchObject({ status: 'paused', time: 1500, stepIndex: 1 })
		driver.seek(-10)
		expect(driver.state.value.time).toBe(0)
	})

	it('seek в конец — ended; во время проигрывания состояние playing сохраняется', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.seek(99999)
		expect(driver.state.value).toMatchObject({ status: 'ended', time: 2000 })
		driver.stop()
		driver.play()
		driver.seek(1000)
		expect(driver.state.value).toMatchObject({ status: 'playing', time: 1000 })
	})

	it('seek по id и номеру шага; неизвестный шаг игнорируется', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.seek({ step: 'b' })
		expect(driver.state.value.time).toBe(1000)
		driver.seek({ step: 0 })
		expect(driver.state.value.time).toBe(0)
		driver.seek({ step: 'нет' })
		expect(driver.state.value.time).toBe(0)
		expect(driver.state.value.status).toBe('paused')
	})

	it('step(1) и step(-1) идут по началам шагов и останавливают часы', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.step(1)
		expect(driver.state.value).toMatchObject({ status: 'paused', time: 0, stepIndex: 0 })
		driver.step(1)
		expect(driver.state.value).toMatchObject({ status: 'paused', time: 1000, stepIndex: 1 })
		driver.step(1)
		expect(driver.state.value).toMatchObject({ status: 'ended', time: 2000 })
		driver.step(-1)
		expect(driver.state.value).toMatchObject({ status: 'paused', time: 0 })
		driver.step(-1)
		expect(driver.state.value).toMatchObject({ status: 'idle', time: 0 })
	})

	it('step во время проигрывания гасит часы', () => {
		const { driver } = mountScenario({ data: mapOf() })
		driver.play()
		frames.run(160, 16)
		driver.step(1)
		expect(driver.state.value.status).toBe('paused')
		expect(frames.pending()).toBe(0)
	})
})

describe('useFlowScenario: выбор сценария', () => {
	const data = mapOf([checkout, refund])

	it('без выбора берётся первый; select и play(id) переключают и сбрасывают ход', () => {
		const { driver, details } = mountScenario({ data })
		expect(driver.state.value.scenario).toBe('checkout')
		driver.seek(1000)
		details.select('refund')
		expect(driver.state.value).toMatchObject({ scenario: 'refund', status: 'idle', time: 0 })
		driver.play('checkout')
		expect(driver.state.value).toMatchObject({ scenario: 'checkout', status: 'playing' })
	})

	it('проп scenario выбирает сценарий и следует за изменением; null возвращает первый', async () => {
		const { driver, props } = mountScenario({ data, props: { scenario: 'refund' } })
		expect(driver.state.value.scenario).toBe('refund')
		props.scenario = 'checkout'
		await flushPromises()
		expect(driver.state.value.scenario).toBe('checkout')
		props.scenario = undefined
		await flushPromises()
		expect(driver.state.value.scenario).toBe('checkout')
	})

	it('actions отдаёт шаги всех веток по id', () => {
		const nested: FlowScenario = {
			id: 'n',
			label: 'N',
			steps: [
				{ type: 'parallel', id: 'p', branches: [[act('x')], [act('y')]] },
				{ type: 'choice', id: 'c', branches: [{ id: 'one', steps: [act('z')] }] },
			],
		}
		const { details } = mountScenario({ data: mapOf([nested]) })
		expect([...details.actions.value.keys()]).toEqual(['x', 'y', 'z'])
	})
})

describe('useFlowScenario: сценарий по модели нотации', () => {
	const simulated: FlowScenario = { id: 'sim', label: 'Обход', steps: [act('s1', { edge: 'e1', duration: 400 })] }

	it('без сценариев в данных строится нотацией, получает выбранные ветки', () => {
		const simulate = vi.fn(() => simulated)
		const { driver, details } = mountScenario({
			data: mapOf([]),
			props: { choices: { gw: 'yes' } },
			notation: { semantics: { simulate } },
		})
		expect(details.isSimulated.value).toBe(true)
		expect(driver.state.value).toMatchObject({ scenario: 'sim', duration: 400 })
		expect(simulate.mock.calls[0][1]).toEqual({ gw: 'yes' })
	})

	it('данные без поля scenarios — сценариев нет', () => {
		const { details } = mountScenario({ data: { version: 1, nodes: [], edges: [] } })
		expect(details.scenarios.value).toEqual([])
	})

	it('нотация без обхода или с пустым итогом — сценария нет', () => {
		const { details } = mountScenario({ data: mapOf([]), notation: { semantics: { gateways: {} } } })
		expect(details.scenario.value).toBeNull()
		const empty = mountScenario({ data: mapOf([]), notation: { semantics: { simulate: () => null } } })
		expect(empty.details.scenario.value).toBeNull()
	})

	it('сценарий из данных важнее построенного', () => {
		const { details } = mountScenario({ data: mapOf(), notation: { semantics: { simulate: () => simulated } } })
		expect(details.isSimulated.value).toBe(false)
		expect(details.scenario.value?.id).toBe('checkout')
	})
})

describe('useFlowScenario: эффекты шагов из нотации', () => {
	it('эффект берётся из вида связи, иначе travel', () => {
		const { driver } = mountScenario({
			data: mapOf([
				{ id: 's', label: 'S', steps: [act('a', { edge: 'e1' }), act('b', { edge: 'e2' }), act('c', { edge: 'ghost' })] },
			]),
			edgeEffect: item => (item.id === 'e1' ? 'draw' : undefined),
		})
		expect(driver.timeline.value.map(entry => entry.effect)).toEqual(['draw', 'travel', 'travel'])
	})
})

describe('useFlowScenario: ветвление и хук resolveChoice', () => {
	const branching: FlowScenario = {
		id: 'pay',
		label: 'Оплата',
		steps: [
			{
				type: 'choice',
				id: 'gate',
				branches: [
					{ id: 'ok', condition: 'прошла', steps: [act('ship', { duration: 300 })] },
					{ id: 'fail', condition: 'отказ', steps: [act('cancel', { duration: 700 })] },
				],
			},
		],
	}
	const data = mapOf([branching])

	it('без хука и choices идёт ветка по умолчанию; проп choices меняет ветку и длительность', () => {
		const { driver, props, details } = mountScenario({ data })
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['ship'])
		props.choices = { gate: 'fail' }
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['cancel'])
		expect(driver.state.value.duration).toBe(700)
		expect(details.choices.value).toEqual({ gate: 'fail' })
	})

	it('play ждёт ответ хука resolveChoice и строит сценарий по ответу', async () => {
		const { driver, hooks, details } = mountScenario({ data })
		const handler = vi.fn(async () => 'fail')
		hooks.on('resolveChoice', handler)
		driver.play()
		expect(driver.state.value.status).toBe('idle')
		await flushPromises()
		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.mock.calls[0]).toMatchObject([{ step: { id: 'gate' }, scenario: { id: 'pay' } }])
		expect(driver.state.value.status).toBe('playing')
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['cancel'])
		expect(details.choices.value).toEqual({ gate: 'fail' })
	})

	it('хук получает ветку по умолчанию как начальное значение; ответ без значения оставляет её', async () => {
		const { driver, hooks } = mountScenario({ data })
		hooks.on('resolveChoice', () => undefined)
		driver.play()
		await flushPromises()
		expect(driver.state.value.status).toBe('playing')
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['ship'])
	})

	it('проп choices важнее ответа хука: хук не спрашивается о выбранном', async () => {
		const { driver, hooks } = mountScenario({ data, props: { choices: { gate: 'ok' } } })
		const handler = vi.fn(() => 'fail')
		hooks.on('resolveChoice', handler)
		driver.play()
		await flushPromises()
		expect(handler).not.toHaveBeenCalled()
		expect(driver.timeline.value.map(entry => entry.step)).toEqual(['ship'])
	})

	it('пауза или остановка до ответа хука отменяют запуск', async () => {
		const first = mountScenario({ data })
		first.hooks.on('resolveChoice', async () => 'fail')
		first.driver.play()
		first.driver.pause()
		await flushPromises()
		expect(first.driver.state.value.status).toBe('idle')
		const second = mountScenario({ data })
		second.hooks.on('resolveChoice', async () => 'fail')
		second.driver.play()
		second.driver.stop()
		await flushPromises()
		expect(second.driver.state.value.status).toBe('idle')
		expect(second.driver.timeline.value.map(entry => entry.step)).toEqual(['ship'])
	})

	it('смена сценария до ответа хука отменяет запуск, ответы старого не попадают в новый', async () => {
		const { driver, hooks, details } = mountScenario({ data: mapOf([branching, refund]) })
		hooks.on('resolveChoice', async () => 'fail')
		driver.play()
		details.select('refund')
		await flushPromises()
		expect(driver.state.value).toMatchObject({ scenario: 'refund', status: 'idle' })
		expect(details.choices.value).toEqual({})
	})

	it('ветвление без веток: хук получает пустое начальное значение', async () => {
		const empty: FlowScenario = { id: 'e', label: 'E', steps: [{ type: 'choice', id: 'g', branches: [] }, act('t', { duration: 100 })] }
		const { driver, hooks } = mountScenario({ data: mapOf([empty]) })
		const handler = vi.fn(() => undefined)
		hooks.on('resolveChoice', handler)
		driver.play()
		await flushPromises()
		expect(handler).toHaveBeenCalledTimes(1)
		expect(driver.state.value.status).toBe('playing')
	})

	it('продолжение после паузы не переспрашивает хук', async () => {
		const { driver, hooks } = mountScenario({ data })
		const handler = vi.fn(async () => 'fail')
		hooks.on('resolveChoice', handler)
		driver.play()
		await flushPromises()
		driver.pause()
		driver.play()
		await flushPromises()
		expect(handler).toHaveBeenCalledTimes(1)
		expect(driver.state.value.status).toBe('playing')
	})
})

describe('useFlowScenario: автозапуск', () => {
	it('isAutoplay запускает сценарий при монтировании молча, действие пользователя снимает тишину', () => {
		const { driver, details } = mountScenario({ data: mapOf(), props: { isAutoplay: true } })
		expect(driver.state.value.status).toBe('playing')
		expect(details.isSilent.value).toBe(true)
		driver.pause()
		expect(details.isSilent.value).toBe(false)
		driver.play()
		driver.stop()
		expect(details.isSilent.value).toBe(false)
	})

	it('каждая команда пользователя (seek, step) снимает тишину', () => {
		const first = mountScenario({ data: mapOf(), props: { isAutoplay: true } })
		first.driver.seek(500)
		expect(first.details.isSilent.value).toBe(false)
		const second = mountScenario({ data: mapOf(), props: { isAutoplay: true } })
		second.driver.step(1)
		expect(second.details.isSilent.value).toBe(false)
	})

	it('без isAutoplay и при reduced motion сценарий не стартует и молчание не включается', () => {
		const plain = mountScenario({ data: mapOf() })
		expect(plain.driver.state.value.status).toBe('idle')
		expect(plain.details.isSilent.value).toBe(false)
		const reduced = mountScenario({ data: mapOf(), props: { isAutoplay: true }, isReducedMotion: true })
		expect(reduced.driver.state.value.status).toBe('idle')
		expect(reduced.details.isSilent.value).toBe(false)
	})

	it('setSpeed — не команда пользователя о ходе: тишину не снимает', () => {
		const { driver, details } = mountScenario({ data: mapOf(), props: { isAutoplay: true } })
		driver.setSpeed(2)
		expect(details.isSilent.value).toBe(true)
	})
})

describe('useFlowScenario: вне компонента', () => {
	it('работает без provide подробностей; onMounted без компонента — ожидаемое предупреждение Vue', () => {
		const warn = guard.warn()
		const scope = effectScope()
		const harness = scope.run(() => mountOutside())
		expect(harness?.state.value.scenario).toBe('checkout')
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0][0])).toContain('onMounted')
		warn.mockClear()
		scope.stop()
	})
})
