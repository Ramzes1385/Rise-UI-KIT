import { UI_IMAGE_MAP } from '@/locales/messages'
import { formatMessage, getLocale } from '@/locales/state'
import type { ImageMapHoursDay, ImageMapHoursState } from '../../types/ImageMapHours.types'
import type { HoursRange, ParsedHours, ZonedMoment } from '../../types/internal/imageMapInternal.types'
import { DAY_MINUTES, DAY_MS, dayRanges, hoursPhase, weekdayIndex, zonedMoment } from './hoursSchedule'

const MONDAY = Date.UTC(2024, 0, 1)

function clock(minutes: number, locale: string): string {
	const wall = Date.UTC(2024, 0, 1, 0, minutes % DAY_MINUTES)
	return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(wall)
}

function weekday(day: number, locale: string): string {
	return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(day)
}

function template(isOpen: boolean, isSoon: boolean): string {
	if (isOpen) return isSoon ? UI_IMAGE_MAP.OPEN_UNTIL : UI_IMAGE_MAP.OPEN_UNTIL_DAY
	return isSoon ? UI_IMAGE_MAP.CLOSED_OPENS : UI_IMAGE_MAP.CLOSED_OPENS_DAY
}

function phaseText(hours: ParsedHours, moment: ZonedMoment, locale: string): Pick<ImageMapHoursState, 'isOpen' | 'isAlwaysOpen' | 'text'> {
	const { isOpen, isAlwaysOpen, change } = hoursPhase(hours, moment)
	if (isAlwaysOpen) return { isOpen, isAlwaysOpen, text: UI_IMAGE_MAP.ALWAYS_OPEN }
	if (change === null) return { isOpen, isAlwaysOpen, text: UI_IMAGE_MAP.CLOSED }
	const time = clock(change, locale)
	const isSoon = change - moment.minutes <= DAY_MINUTES
	const day = weekday(moment.day + Math.floor(change / DAY_MINUTES) * DAY_MS, locale)
	return { isOpen, isAlwaysOpen, text: formatMessage(template(isOpen, isSoon), { time, day }) }
}

function rangesText(ranges: HoursRange[], locale: string): string {
	if (!ranges.length) return UI_IMAGE_MAP.DAY_OFF
	if (ranges.some(range => range.end - range.start >= DAY_MINUTES)) return UI_IMAGE_MAP.ALL_DAY
	return ranges.map(range => `${clock(range.start, locale)}–${clock(range.end, locale)}`).join(', ')
}

function schedule(hours: ParsedHours, moment: ZonedMoment, locale: string): ImageMapHoursDay[] {
	const today = weekdayIndex(moment.day)
	const first = (getLocale().firstDayOfWeek + 6) % 7
	return Array.from({ length: 7 }, (_, step) => {
		const index = (first + step) % 7
		const isToday = index === today
		const ranges = isToday ? dayRanges(hours, moment.day) : (hours.week[index] as HoursRange[])
		return { day: weekday(MONDAY + index * DAY_MS, locale), text: rangesText(ranges, locale), isToday }
	})
}

export function hoursState(hours: ParsedHours, now: Date): ImageMapHoursState {
	const locale = getLocale().intl
	const moment = zonedMoment(now, hours.timeZone)
	return { ...phaseText(hours, moment, locale), schedule: schedule(hours, moment, locale) }
}
