import { mount } from '@vue/test-utils'
import { setLocale } from '@/locales/state'
import { UI_IMAGE_MAP } from '@/locales/messages'
import { hoursState } from '../../model/hours/hoursFormat'
import { defineComponent, h, nextTick, reactive } from 'vue'
import type { ImageMapData } from '../../types/imageMapData.types'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { ImageMapHours } from '../../types/ImageMapHours.types'
import { useImageMapHours } from '../../model/hours/useImageMapHours'
import { hoursPhase, isValidTimeZone, parseHours, parseRange, zonedMoment } from '../../model/hours/hoursSchedule'

const DAILY: ImageMapHours = {
	week: {
		mon: ['10:00-22:00'],
		tue: ['10:00-22:00'],
		wed: ['10:00-22:00'],
		thu: ['10:00-22:00'],
		fri: ['10:00-22:00'],
		sat: ['10:00-22:00'],
		sun: ['10:00-22:00'],
	},
}

const FRIDAY_18_MSK = new Date('2026-10-02T15:00:00Z')

function textAt(hours: ImageMapHours, now: Date, timeZone = 'Europe/Moscow'): string {
	return hoursState(parseHours('shop', hours, timeZone), now).text
}

describe('часы работы — разбор', () => {
	it('интервал: обычный, через полночь, весь день, тире и пробелы', () => {
		expect(parseRange('10:00-22:00')).toEqual({ start: 600, end: 1320 })
		expect(parseRange('22:00-02:00')).toEqual({ start: 1320, end: 1560 })
		expect(parseRange('00:00-24:00')).toEqual({ start: 0, end: 1440 })
		expect(parseRange('9:30 – 18:00')).toEqual({ start: 570, end: 1080 })
		expect(parseRange('08:00-08:00')).toEqual({ start: 480, end: 1920 })
	})

	it('неверный интервал — null', () => {
		expect(parseRange('10-22')).toBeNull()
		expect(parseRange('10:60-22:00')).toBeNull()
		expect(parseRange('10:00-25:00')).toBeNull()
		expect(parseRange('24:00-02:00')).toBeNull()
	})

	it('неверный интервал пропускается с предупреждением', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const parsed = parseHours('cafe', { week: { mon: ['утро', '10:00-12:00'] }, exceptions: { '2026-10-05': ['x'] } }, undefined)
		expect(parsed.week[0]).toEqual([{ start: 600, end: 720 }])
		expect(parsed.exceptions.get('2026-10-05')).toEqual([])
		expect(spy).toHaveBeenCalledTimes(2)
		expect(spy.mock.calls[0]?.[0]).toContain('«x»')
		expect(spy.mock.calls[1]?.[0]).toContain('«утро»')
		expect(spy.mock.calls[1]?.[0]).toContain('«cafe»')
		spy.mockRestore()
	})

	it('часовой пояс: свой, карты, неизвестный — пояс браузера с предупреждением', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		expect(parseHours('a', { timeZone: 'Asia/Tokyo', week: {} }, 'Europe/Moscow').timeZone).toBe('Asia/Tokyo')
		expect(parseHours('a', { week: {} }, 'Europe/Moscow').timeZone).toBe('Europe/Moscow')
		expect(parseHours('a', { week: {} }, undefined).timeZone).toBeUndefined()
		expect(spy).not.toHaveBeenCalled()
		expect(parseHours('a', { timeZone: 'Mars/Base', week: {} }, undefined).timeZone).toBeUndefined()
		expect(spy.mock.calls[0]?.[0]).toContain('«Mars/Base»')
		expect(isValidTimeZone('Europe/Moscow')).toBe(true)
		expect(isValidTimeZone(undefined)).toBe(true)
		spy.mockRestore()
	})

	it('момент по часам пояса: дата и минуты', () => {
		expect(zonedMoment(FRIDAY_18_MSK, 'Europe/Moscow')).toEqual({ day: Date.UTC(2026, 9, 2), minutes: 18 * 60 })
		expect(zonedMoment(FRIDAY_18_MSK, 'America/New_York')).toEqual({ day: Date.UTC(2026, 9, 2), minutes: 11 * 60 })
		expect(zonedMoment(new Date('2026-10-02T22:30:00Z'), 'Asia/Tokyo')).toEqual({ day: Date.UTC(2026, 9, 3), minutes: 7 * 60 + 30 })
		const local = new Date('2026-10-02T22:30:00Z')
		expect(zonedMoment(local, undefined)).toEqual({
			day: Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()),
			minutes: local.getHours() * 60 + local.getMinutes(),
		})
	})
})

describe('часы работы — состояние', () => {
	beforeEach(() => setLocale('ru'))

	it('открыто до вечера и закрыто до утра', () => {
		expect(textAt(DAILY, FRIDAY_18_MSK)).toBe('Открыто до 22:00')
		expect(textAt(DAILY, new Date('2026-10-02T20:00:00Z'))).toBe('Закрыто, откроется в 10:00')
		expect(textAt(DAILY, new Date('2026-10-02T05:00:00Z'))).toBe('Закрыто, откроется в 10:00')
		expect(hoursState(parseHours('shop', DAILY, 'Europe/Moscow'), FRIDAY_18_MSK).isOpen).toBe(true)
	})

	it('один момент — разное состояние в разных поясах', () => {
		const evening = new Date('2026-10-02T17:30:00Z')
		expect(textAt(DAILY, evening, 'Europe/Moscow')).toBe('Открыто до 22:00')
		expect(textAt(DAILY, evening, 'Asia/Yekaterinburg')).toBe('Закрыто, откроется в 10:00')
		expect(textAt({ ...DAILY, timeZone: 'Asia/Yekaterinburg' }, evening, 'Europe/Moscow')).toBe('Закрыто, откроется в 10:00')
	})

	it('через полночь: вечер пятницы и ночь субботы — открыто до 2:00', () => {
		const bar: ImageMapHours = { week: { fri: ['20:00-02:00'] } }
		expect(textAt(bar, new Date('2026-10-02T18:00:00Z'))).toBe('Открыто до 2:00')
		expect(textAt(bar, new Date('2026-10-02T22:30:00Z'))).toBe('Открыто до 2:00')
		expect(textAt(bar, new Date('2026-10-02T23:30:00Z'))).toBe('Закрыто, откроется пт в 20:00')
		expect(textAt(bar, new Date('2026-10-02T12:00:00Z'))).toBe('Закрыто, откроется в 20:00')
	})

	it('смежные интервалы сливаются: закрытие — в конце последнего', () => {
		const late: ImageMapHours = { week: { fri: ['10:00-24:00'], sat: ['00:00-03:00', '02:00-04:00'] } }
		expect(textAt(late, FRIDAY_18_MSK)).toBe('Открыто до 4:00')
	})

	it('круглосуточно — неделя без перерыва', () => {
		const always: ImageMapHours = {
			week: Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => [day, ['00:00-24:00']])),
		}
		const state = hoursState(parseHours('h', always, 'Europe/Moscow'), FRIDAY_18_MSK)
		expect(state).toMatchObject({ isOpen: true, isAlwaysOpen: true, text: UI_IMAGE_MAP.ALWAYS_OPEN })
		expect(state.schedule.every(row => row.text === UI_IMAGE_MAP.ALL_DAY)).toBe(true)
	})

	it('закрытие или открытие позже чем через сутки — с днём недели', () => {
		const weekend: ImageMapHours = { week: { fri: ['00:00-24:00'], sat: ['00:00-24:00'], mon: ['10:00-19:00'] } }
		expect(textAt(weekend, FRIDAY_18_MSK)).toBe('Открыто до 0:00 (вс)')
		expect(textAt(weekend, new Date('2026-10-04T12:00:00Z'))).toBe('Закрыто, откроется в 10:00')
		expect(textAt({ week: { mon: ['10:00-19:00'] } }, FRIDAY_18_MSK)).toBe('Закрыто, откроется пн в 10:00')
	})

	it('нет работы неделю вперёд — «Закрыто»', () => {
		const state = hoursState(parseHours('x', { week: {} }, 'Europe/Moscow'), FRIDAY_18_MSK)
		expect(state).toMatchObject({ isOpen: false, isAlwaysOpen: false, text: UI_IMAGE_MAP.CLOSED })
	})

	it('исключение по дате заменяет день; пустое — закрыто', () => {
		const holiday: ImageMapHours = { ...DAILY, exceptions: { '2026-10-02': [] } }
		expect(textAt(holiday, FRIDAY_18_MSK)).toBe('Закрыто, откроется в 10:00')
		const short: ImageMapHours = { ...DAILY, exceptions: { '2026-10-02': ['10:00-19:00'] } }
		expect(textAt(short, FRIDAY_18_MSK)).toBe('Открыто до 19:00')
		expect(hoursPhase(parseHours('s', short, 'Europe/Moscow'), { day: Date.UTC(2026, 9, 2), minutes: 1150 })).toEqual({
			isOpen: false,
			isAlwaysOpen: false,
			change: 2040,
		})
	})

	it('расписание недели: с понедельника, сегодня отмечено и с исключением', () => {
		const hours: ImageMapHours = {
			week: { mon: ['10:00-14:00', '15:00-19:00'], fri: ['10:00-22:00'] },
			exceptions: { '2026-10-02': ['12:00-16:00'] },
		}
		const { schedule } = hoursState(parseHours('s', hours, 'Europe/Moscow'), FRIDAY_18_MSK)
		expect(schedule.map(row => row.day)).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'])
		expect(schedule[0]).toEqual({ day: 'пн', text: '10:00–14:00, 15:00–19:00', isToday: false })
		expect(schedule[1]?.text).toBe(UI_IMAGE_MAP.DAY_OFF)
		expect(schedule[4]).toEqual({ day: 'пт', text: '12:00–16:00', isToday: true })
	})

	it('английский: время и дни по Intl, неделя с воскресенья', () => {
		setLocale('en')
		const state = hoursState(parseHours('s', { week: { mon: ['10:00-19:00'] } }, 'Europe/Moscow'), FRIDAY_18_MSK)
		expect(state.text).toBe('Closed, opens Mon at 10:00 AM')
		expect(state.schedule[0]?.day).toBe('Sun')
		expect(textAt(DAILY, FRIDAY_18_MSK)).toBe('Open until 10:00 PM')
		setLocale('ru')
	})
})

const HoursProbe = defineComponent({
	props: { state: { type: Object, required: true } },
	setup(props) {
		const hours = useImageMapHours(props.state as unknown as ImageMapProps)
		return () =>
			h('p', [hours.hoursOf('shop')?.text ?? '—', ' ', String(hours.isOpenNow('shop')), ' ', String(hours.isOpenNow('none'))])
	},
})

function probeData(withHours = true): ImageMapData {
	return {
		timeZone: 'Europe/Moscow',
		layers: [{ id: 'l', title: 'L', width: 10, height: 10 }],
		objects: [
			{ id: 'shop', type: 'point', title: 'Shop', x: 0, y: 0, hours: withHours ? DAILY : undefined },
			{ id: 'none', type: 'point', title: 'None', x: 1, y: 1 },
		],
	}
}

describe('useImageMapHours — сейчас и часы', () => {
	beforeEach(() => {
		setLocale('ru')
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-10-02T18:59:30Z'))
	})
	afterEach(() => vi.useRealTimers())

	it('обновляется в начале минуты: в 22:00 закрывается', async () => {
		const wrapper = mount(HoursProbe, { props: { state: reactive({ data: probeData() }) } })
		expect(wrapper.text()).toBe('Открыто до 22:00 true false')
		await vi.advanceTimersByTimeAsync(30_000)
		expect(wrapper.text()).toBe('Закрыто, откроется в 10:00 false false')
		expect(vi.getTimerCount()).toBe(1)
		wrapper.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('без часов у объектов таймера нет; часы появились — таймер пошёл', async () => {
		const state = reactive({ data: probeData(false) })
		const wrapper = mount(HoursProbe, { props: { state } })
		expect(wrapper.text()).toBe('— false false')
		expect(vi.getTimerCount()).toBe(0)
		state.data = probeData()
		await nextTick()
		expect(vi.getTimerCount()).toBe(1)
		expect(wrapper.text()).toBe('Открыто до 22:00 true false')
		wrapper.unmount()
	})

	it('проп now — свой момент без таймера', async () => {
		const state = reactive<{ data: ImageMapData; now?: number }>({ data: probeData(), now: Date.parse('2026-10-02T05:00:00Z') })
		const wrapper = mount(HoursProbe, { props: { state } })
		expect(wrapper.text()).toBe('Закрыто, откроется в 10:00 false false')
		expect(vi.getTimerCount()).toBe(0)
		state.now = undefined
		await nextTick()
		expect(wrapper.text()).toBe('Открыто до 22:00 true false')
		expect(vi.getTimerCount()).toBe(1)
		wrapper.unmount()
	})
})
