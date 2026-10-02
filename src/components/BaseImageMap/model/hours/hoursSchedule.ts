import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import { IMAGE_MAP_WEEKDAYS } from '../../types/ImageMapHours.types'
import type { ImageMapHours, ImageMapTimeRange } from '../../types/ImageMapHours.types'
import type { HoursPhase, HoursRange, ParsedHours, ZonedMoment } from '../../types/imageMapInternal.types'

export const DAY_MINUTES = 1440
export const DAY_MS = 86_400_000
const HORIZON_DAYS = 7
const RANGE_PATTERN = /^\s*(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\s*$/
const partsFormats = new Map<string, Intl.DateTimeFormat>()

function toMinutes(hours: string, minutes: string): number | null {
	const value = Number(hours) * 60 + Number(minutes)
	return Number(minutes) < 60 && value <= DAY_MINUTES ? value : null
}

export function parseRange(range: ImageMapTimeRange): HoursRange | null {
	const match = RANGE_PATTERN.exec(range)
	if (!match) return null
	const start = toMinutes(match[1] as string, match[2] as string)
	const end = toMinutes(match[3] as string, match[4] as string)
	if (start === null || end === null || start === DAY_MINUTES) return null
	return { start, end: end > start ? end : end + DAY_MINUTES }
}

function parseRanges(ranges: ImageMapTimeRange[] | undefined, id: string): HoursRange[] {
	return (ranges ?? []).flatMap(range => {
		const parsed = parseRange(range)
		if (!parsed) warn(UI_WARNINGS.IMAGE_MAP_HOURS_RANGE, { range, id })
		return parsed ? [parsed] : []
	})
}

export function isValidTimeZone(timeZone: string | undefined): boolean {
	if (!timeZone) return true
	try {
		new Intl.DateTimeFormat('en-US', { timeZone })
		return true
	} catch {
		return false
	}
}

function resolveTimeZone(timeZone: string | undefined): string | undefined {
	if (isValidTimeZone(timeZone)) return timeZone
	warn(UI_WARNINGS.IMAGE_MAP_TIME_ZONE, { zone: String(timeZone) })
	return undefined
}

export function parseHours(id: string, hours: ImageMapHours, mapTimeZone: string | undefined): ParsedHours {
	const exceptions = Object.entries(hours.exceptions ?? {}).map(([date, ranges]): [string, HoursRange[]] => [
		date,
		parseRanges(ranges, id),
	])
	return {
		timeZone: resolveTimeZone(hours.timeZone ?? mapTimeZone),
		week: IMAGE_MAP_WEEKDAYS.map(day => parseRanges(hours.week[day], id)),
		exceptions: new Map(exceptions),
	}
}

function partsFormat(timeZone: string | undefined): Intl.DateTimeFormat {
	const key = timeZone ?? ''
	const cached = partsFormats.get(key)
	if (cached) return cached
	const format = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})
	partsFormats.set(key, format)
	return format
}

export function zonedMoment(now: Date, timeZone: string | undefined): ZonedMoment {
	const parts = Object.fromEntries(
		partsFormat(timeZone)
			.formatToParts(now)
			.map(part => [part.type, Number(part.value)]),
	)
	return {
		day: Date.UTC(parts.year as number, (parts.month as number) - 1, parts.day as number),
		minutes: ((parts.hour as number) % 24) * 60 + (parts.minute as number),
	}
}

export function weekdayIndex(day: number): number {
	return (new Date(day).getUTCDay() + 6) % 7
}

export function dayRanges(hours: ParsedHours, day: number): HoursRange[] {
	const date = new Date(day).toISOString().slice(0, 10)
	return hours.exceptions.get(date) ?? (hours.week[weekdayIndex(day)] as HoursRange[])
}

function mergeRanges(ranges: HoursRange[]): HoursRange[] {
	const sorted = [...ranges].sort((a, b) => a.start - b.start)
	return sorted.reduce<HoursRange[]>((merged, range) => {
		const last = merged[merged.length - 1]
		if (last && range.start <= last.end) last.end = Math.max(last.end, range.end)
		else merged.push({ ...range })
		return merged
	}, [])
}

function timeline(hours: ParsedHours, today: number): HoursRange[] {
	const ranges: HoursRange[] = []
	for (let offset = -1; offset <= HORIZON_DAYS; offset++) {
		const shift = offset * DAY_MINUTES
		for (const range of dayRanges(hours, today + offset * DAY_MS)) ranges.push({ start: range.start + shift, end: range.end + shift })
	}
	return mergeRanges(ranges)
}

export function hoursPhase(hours: ParsedHours, moment: ZonedMoment): HoursPhase {
	const ranges = timeline(hours, moment.day)
	const current = ranges.find(range => range.start <= moment.minutes && moment.minutes < range.end)
	if (current) {
		const isAlwaysOpen = current.end >= (HORIZON_DAYS + 1) * DAY_MINUTES
		return { isOpen: true, isAlwaysOpen, change: isAlwaysOpen ? null : current.end }
	}
	const next = ranges.find(range => range.start > moment.minutes)
	return { isOpen: false, isAlwaysOpen: false, change: next ? next.start : null }
}
