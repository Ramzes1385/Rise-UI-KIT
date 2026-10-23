import { STORY_TODAY } from '../../render/data/fixtures'
import { freezeStoryClock } from '../../render/data/clock'

const RealDate = Date

describe('freezeStoryClock', () => {
	it('new Date() даёт STORY_TODAY, Date.now() и Date с аргументами работают как обычно', () => {
		const restore = freezeStoryClock()
		expect(new Date().getTime()).toBe(STORY_TODAY.getTime())
		expect(Date.now()).not.toBe(STORY_TODAY.getTime())
		expect(Math.abs(Date.now() - RealDate.now())).toBeLessThan(1000)
		expect(new Date(2020, 0, 2).getFullYear()).toBe(2020)
		expect(new Date(5).getTime()).toBe(5)
		restore()
	})

	it('возвращённая функция возвращает настоящие часы; можно задать свою дату', () => {
		const custom = new Date(2030, 1, 3)
		const restore = freezeStoryClock(custom)
		expect(new Date().getTime()).toBe(custom.getTime())
		restore()
		expect(Date.now()).not.toBe(custom.getTime())
	})
})
