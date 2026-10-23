import { act } from '../helpers/flowFixtures.test-utils'
import { buildTimeline } from '../../model/scenario/timeline'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { advanceClock, clampSpeed, seekTarget, snapshotScenario, stepTarget } from '../../model/scenario/player'

const build = buildTimeline(
	{
		id: 's',
		label: 'S',
		steps: [
			act('a', { duration: 1000 }),
			{ type: 'parallel', id: 'p', branches: [[act('b', { duration: 500 })], [act('c', { duration: 800 })]] },
			act('d', { duration: 1000 }),
		],
	},
	{},
)

guardConsole()

describe('clampSpeed', () => {
	it('скорость зажимается в 0,25..4, нечисло — 1', () => {
		expect(clampSpeed(2)).toBe(2)
		expect(clampSpeed(0)).toBe(0.25)
		expect(clampSpeed(99)).toBe(4)
		expect(clampSpeed(Number.NaN)).toBe(1)
		expect(clampSpeed(Number.POSITIVE_INFINITY)).toBe(1)
	})
})

describe('advanceClock', () => {
	it('прибавляет дельту с учётом скорости', () => {
		expect(advanceClock({ time: 0, delta: 50, speed: 2, duration: 1000 })).toEqual({ time: 100, status: 'playing' })
	})

	it('кадр длиннее 100 мс режется: возврат на вкладку не делает прыжка', () => {
		expect(advanceClock({ time: 0, delta: 5000, speed: 1, duration: 10000 })).toEqual({ time: 100, status: 'playing' })
	})

	it('отрицательная дельта не двигает время назад', () => {
		expect(advanceClock({ time: 300, delta: -40, speed: 1, duration: 1000 })).toEqual({ time: 300, status: 'playing' })
	})

	it('на конце сценария время упирается в длительность, состояние ended', () => {
		expect(advanceClock({ time: 990, delta: 50, speed: 1, duration: 1000 })).toEqual({ time: 1000, status: 'ended' })
		expect(advanceClock({ time: 900, delta: 100, speed: 1, duration: 1000 })).toEqual({ time: 1000, status: 'ended' })
	})
})

describe('snapshotScenario', () => {
	const input = { scenario: 's', speed: 1 }

	it('idle: время 0, шага нет, ничего не идёт и не пройдено', () => {
		expect(snapshotScenario({ ...input, status: 'idle', time: 700 }, build)).toEqual({
			scenario: 's',
			status: 'idle',
			time: 0,
			duration: 2800,
			stepIndex: -1,
			stepCount: 4,
			activeSteps: [],
			doneSteps: [],
			speed: 1,
		})
	})

	it('playing: идущие шаги параллельных веток вместе, пройденные отдельно', () => {
		const state = snapshotScenario({ ...input, status: 'playing', time: 1200 }, build)
		expect(state.activeSteps).toEqual(['b', 'c'])
		expect(state.doneSteps).toEqual(['a'])
		expect(state.stepIndex).toBe(2)
		const later = snapshotScenario({ ...input, status: 'playing', time: 1600 }, build)
		expect(later.activeSteps).toEqual(['c'])
		expect(later.doneSteps).toEqual(['a', 'b'])
	})

	it('paused: так же, как playing, а время зажато в длительность', () => {
		const state = snapshotScenario({ ...input, status: 'paused', time: 99999, speed: 2 }, build)
		expect(state.time).toBe(2800)
		expect(state.speed).toBe(2)
		expect(state.doneSteps).toEqual(['a', 'b', 'c', 'd'])
	})

	it('ended: все пройдены, активных нет, последний шаг текущий', () => {
		const state = snapshotScenario({ ...input, status: 'ended', time: 2800 }, build)
		expect(state.activeSteps).toEqual([])
		expect(state.doneSteps).toEqual(['a', 'b', 'c', 'd'])
		expect(state.stepIndex).toBe(3)
	})

	it('сценарий без шагов: пустой снимок', () => {
		const state = snapshotScenario({ scenario: null, status: 'ended', time: 0, speed: 1 }, { entries: [], duration: 0 })
		expect(state).toMatchObject({ scenario: null, stepIndex: -1, stepCount: 0, activeSteps: [], doneSteps: [] })
	})
})

describe('seekTarget', () => {
	it('число — время, зажатое в пределы', () => {
		expect(seekTarget(build, 500)).toBe(500)
		expect(seekTarget(build, -1)).toBe(0)
		expect(seekTarget(build, 9999)).toBe(2800)
		expect(seekTarget(build, Number.NaN)).toBe(0)
	})

	it('у сценария без длительности любое время — 0', () => {
		expect(seekTarget({ entries: [], duration: -3 }, 10)).toBe(0)
	})

	it('шаг по номеру (дробная часть отбрасывается) и по id — его начало', () => {
		expect(seekTarget(build, { step: 3 })).toBe(1800)
		expect(seekTarget(build, { step: 1.9 })).toBe(1000)
		expect(seekTarget(build, { step: 'c' })).toBe(1000)
	})

	it('неизвестный шаг — null', () => {
		expect(seekTarget(build, { step: 'нет' })).toBeNull()
		expect(seekTarget(build, { step: 9 })).toBeNull()
		expect(seekTarget(build, { step: -1 })).toBeNull()
	})
})

describe('stepTarget', () => {
	it('вперёд из idle встаёт на первый шаг в паузе', () => {
		expect(stepTarget(build, { status: 'idle', time: 0 }, 1)).toEqual({ time: 0, status: 'paused' })
	})

	it('вперёд идёт по различным началам: параллельные шаги — один шаг', () => {
		expect(stepTarget(build, { status: 'paused', time: 0 }, 1)).toEqual({ time: 1000, status: 'paused' })
		expect(stepTarget(build, { status: 'paused', time: 1000 }, 1)).toEqual({ time: 1800, status: 'paused' })
		expect(stepTarget(build, { status: 'playing', time: 1400 }, 1)).toEqual({ time: 1800, status: 'paused' })
	})

	it('вперёд с последнего шага — конец', () => {
		expect(stepTarget(build, { status: 'paused', time: 1800 }, 1)).toEqual({ time: 2800, status: 'ended' })
	})

	it('назад: на предыдущее начало, с первого шага — в начало (idle)', () => {
		expect(stepTarget(build, { status: 'paused', time: 1800 }, -1)).toEqual({ time: 1000, status: 'paused' })
		expect(stepTarget(build, { status: 'paused', time: 1000 }, -1)).toEqual({ time: 0, status: 'paused' })
		expect(stepTarget(build, { status: 'paused', time: 0 }, -1)).toEqual({ time: 0, status: 'idle' })
		expect(stepTarget(build, { status: 'idle', time: 0 }, -1)).toEqual({ time: 0, status: 'idle' })
	})

	it('из ended назад идёт на предыдущий от последнего шага, как и номер текущего шага', () => {
		expect(stepTarget(build, { status: 'ended', time: 2800 }, -1)).toEqual({ time: 1000, status: 'paused' })
	})

	it('пустой сценарий: всегда idle', () => {
		const empty = { entries: [], duration: 0 }
		expect(stepTarget(empty, { status: 'idle', time: 0 }, 1)).toEqual({ time: 0, status: 'idle' })
	})
})
