import { subscribeMascot, wakeMascots } from '../model/mascotTicker'
import { AVATAR_MASCOT_PUPIL_RANGE, AVATAR_MASCOT_TILT, AVATAR_MOODS } from '../types/BaseAvatar.types'
import { MASCOT_MOODS, toBrowPath, toFaceVector, toLidOpacity, toMouthPath } from '../model/mascotShapes'
import { isSpringSettled, PUPIL_SPRING, settleSpring, springStep, toPupilOffset, toTilt } from '../model/mascotSpring'

const RECT = { left: 0, top: 0, width: 40, height: 40 } as DOMRect
const FRAME = { seconds: 1 / 60, config: PUPIL_SPRING }

describe('пружина маскота', () => {
	it('шаг ведёт значение к цели и набирает скорость', () => {
		const next = springStep({ value: 0, velocity: 0 }, 10, FRAME)

		expect(next.value).toBeGreaterThan(0)
		expect(next.value).toBeLessThan(10)
		expect(next.velocity).toBeGreaterThan(0)
	})

	it('за несколько секунд пружина приходит к цели с перелётом, но без разлёта', () => {
		let state = { value: 0, velocity: 0 }
		let peak = 0
		for (let index = 0; index < 180; index++) {
			state = springStep(state, 10, FRAME)
			peak = Math.max(peak, state.value)
		}

		expect(peak).toBeGreaterThan(10)
		expect(peak).toBeLessThan(13)
		expect(state.value).toBeCloseTo(10, 2)
	})

	it('отрицательное время ничего не меняет, длинный кадр обрезается до 1/15 с', () => {
		const start = { value: 0, velocity: 0 }

		expect(springStep(start, 10, { ...FRAME, seconds: -1 })).toEqual(start)
		expect(springStep(start, 10, { ...FRAME, seconds: 5 })).toEqual(springStep(start, 10, { ...FRAME, seconds: 1 / 15 }))
	})

	it('успокоилась — только рядом с целью и почти без скорости', () => {
		expect(isSpringSettled({ value: 9.995, velocity: 0.01 }, 10)).toBe(true)
		expect(isSpringSettled({ value: 9.9, velocity: 0 }, 10)).toBe(false)
		expect(isSpringSettled({ value: 10, velocity: 1 }, 10)).toBe(false)
	})

	it('settleSpring ставит ровно в цель, когда пружина успокоилась, иначе — обычный шаг', () => {
		expect(settleSpring({ value: 9.999, velocity: 0 }, 10, FRAME)).toEqual({ value: 10, velocity: 0 })
		expect(settleSpring({ value: 0, velocity: 0 }, 10, FRAME)).toEqual(springStep({ value: 0, velocity: 0 }, 10, FRAME))
	})
})

describe('цели маскота', () => {
	it('зрачок смотрит на курсор и не выходит за край глаза', () => {
		expect(toPupilOffset(RECT, { x: 20, y: 20 })).toEqual({ x: 0, y: 0 })
		expect(toPupilOffset(RECT, { x: 1000, y: 20 })).toEqual({ x: AVATAR_MASCOT_PUPIL_RANGE, y: 0 })
		expect(toPupilOffset(RECT, { x: 20, y: 100 })).toEqual({ x: 0, y: 1.5 })
	})

	it('наклон головы — к курсору, не больше предела', () => {
		expect(toTilt(RECT, { x: 20, y: 0 })).toBe(0)
		expect(toTilt(RECT, { x: 100, y: 0 })).toBe(AVATAR_MASCOT_TILT / 2)
		expect(toTilt(RECT, { x: 5000, y: 0 })).toBe(AVATAR_MASCOT_TILT)
		expect(toTilt(RECT, { x: -5000, y: 0 })).toBe(-AVATAR_MASCOT_TILT)
	})
})

describe('настроения маскота', () => {
	it.each(AVATAR_MOODS)('%s: одинаковый набор чисел, поэтому кривые перетекают друг в друга', mood => {
		const face = toFaceVector(MASCOT_MOODS[mood])

		expect(face).toHaveLength(21)
		expect(toMouthPath(face)).toMatch(/^M\S+ \S+ C\S+ \S+ \S+ \S+ \S+ \S+$/)
		expect(toBrowPath(face, 8)).toMatch(/^M\S+ \S+ Q\S+ \S+ \S+ \S+$/)
	})

	it('пути рта и бровей собираются из чисел лица', () => {
		const face = toFaceVector(MASCOT_MOODS.idle)

		expect(toMouthPath(face)).toBe('M-3.5 10 C-1.17 12 1.17 12 3.5 10')
		expect(toBrowPath(face, 8)).toBe('M-10 -8.5 Q-7 -9.5 -4 -8.5')
		expect(toBrowPath(face, 14)).toBe('M4 -8.5 Q7 -9.5 10 -8.5')
	})

	it('веко проступает, только когда глаз почти закрыт', () => {
		expect(toLidOpacity(1)).toBe(0)
		expect(toLidOpacity(0.08)).toBe(1)
		expect(toLidOpacity(0.325)).toBeCloseTo(0.5)
	})
})

describe('общий тикер маскотов', () => {
	let frames: Array<() => void>

	beforeEach(() => {
		frames = []
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: () => void) => frames.push(callback)),
		)
		vi.stubGlobal('cancelAnimationFrame', vi.fn())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('один слушатель pointermove на все экземпляры, снимается с последним', () => {
		const add = vi.spyOn(document, 'addEventListener')
		const remove = vi.spyOn(document, 'removeEventListener')
		const first = subscribeMascot(() => false)
		const second = subscribeMascot(() => false)

		expect(add.mock.calls.filter(([type]) => type === 'pointermove')).toHaveLength(1)
		first()
		expect(remove).not.toHaveBeenCalledWith('pointermove', expect.any(Function))
		second()
		expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function))
		expect(cancelAnimationFrame).toHaveBeenCalled()
	})

	it('кадры идут, пока хоть один персонаж движется, и получают курсор', () => {
		let moving = 2
		const tick = vi.fn(() => --moving > 0)
		const unsubscribe = subscribeMascot(tick)
		frames.shift()?.()
		document.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 7 }))

		expect(frames).toHaveLength(1)
		frames.shift()?.()
		expect(tick).toHaveBeenLastCalledWith(expect.any(Number), { x: 5, y: 7 })
		expect(frames).toHaveLength(0)
		unsubscribe()
	})

	it('wake не заводит второй кадр и ничего не делает без подписчиков', () => {
		wakeMascots()
		expect(frames).toHaveLength(0)

		const unsubscribe = subscribeMascot(() => false)
		wakeMascots()
		expect(frames).toHaveLength(1)
		unsubscribe()
	})
})
