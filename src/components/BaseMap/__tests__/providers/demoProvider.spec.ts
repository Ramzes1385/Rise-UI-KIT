import { installDemoYandex } from '../../stories/demoProvider'

const target = window as unknown as { ymaps3?: { ready: Promise<void>; YMap: unknown } }

const REAL_API = { ready: Promise.resolve(), YMap: class RealMap {} }

describe('installDemoYandex', () => {
	afterEach(() => {
		delete target.ymaps3
	})

	it('без настоящего API: ставит демо, очистка убирает его', () => {
		const cleanup = installDemoYandex()

		expect(target.ymaps3?.YMap).not.toBe(REAL_API.YMap)
		cleanup()
		expect('ymaps3' in target).toBe(false)
	})

	it('поверх настоящего API: очистка возвращает его, а не удаляет', () => {
		target.ymaps3 = REAL_API
		const cleanup = installDemoYandex({ isPending: true })

		expect(target.ymaps3).not.toBe(REAL_API)
		cleanup()
		expect(target.ymaps3).toBe(REAL_API)
	})

	it('несколько демо на одной странице: настоящий API возвращается после последней очистки в любом порядке', () => {
		target.ymaps3 = REAL_API
		const first = installDemoYandex()
		const second = installDemoYandex({ isPending: true })
		const demo = target.ymaps3

		first()
		expect(target.ymaps3).toBe(demo)
		second()
		expect(target.ymaps3).toBe(REAL_API)
	})

	it('повторный вызов одной очистки ничего не ломает', () => {
		target.ymaps3 = REAL_API
		const first = installDemoYandex()
		const second = installDemoYandex()

		first()
		first()
		expect(target.ymaps3).not.toBe(REAL_API)
		second()
		expect(target.ymaps3).toBe(REAL_API)
	})
})
