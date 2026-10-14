import { STORY_TODAY } from '../render/data/fixtures'
import { freezeStoryClock } from '../render/data/clock'

describe('freezeStoryClock', () => {
	it('new Date() и Date.now() дают STORY_TODAY, Date с аргументами работает как обычно', () => {
		const restore = freezeStoryClock()
		expect(new Date().getTime()).toBe(STORY_TODAY.getTime())
		expect(Date.now()).toBe(STORY_TODAY.getTime())
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
