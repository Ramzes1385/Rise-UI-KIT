import { UI_COUNTDOWN } from '@/locales/messages'
import { COUNTDOWN_UNITS } from '../../types/BaseCountdown.types'
import { formatMessage, formatNumber, getLocale } from '@/locales/state'
import type { CountdownParts, CountdownUnit } from '../../types/BaseCountdown.types'

const UNIT_MS: Record<CountdownUnit, number> = { days: 86_400_000, hours: 3_600_000, minutes: 60_000, seconds: 1000 }

const INTL_UNIT: Record<CountdownUnit, string> = { days: 'day', hours: 'hour', minutes: 'minute', seconds: 'second' }

export function toTimestamp(value: Date | number | string): number {
	return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

export function orderedUnits(format: readonly CountdownUnit[]): CountdownUnit[] {
	const units = COUNTDOWN_UNITS.filter(unit => format.includes(unit))
	return units.length ? units : [...COUNTDOWN_UNITS]
}

export function splitRemaining(total: number, units: readonly CountdownUnit[]): CountdownParts {
	const parts: CountdownParts = { days: 0, hours: 0, minutes: 0, seconds: 0, total, isFinished: total <= 0 }
	const smallest = UNIT_MS[units[units.length - 1]]
	let rest = Math.ceil(total / smallest) * smallest
	for (const unit of units) {
		parts[unit] = Math.floor(rest / UNIT_MS[unit])
		rest -= parts[unit] * UNIT_MS[unit]
	}
	return parts
}

function unitText(value: number, unit: CountdownUnit, unitDisplay: 'long' | 'short'): string {
	return formatNumber(value, { style: 'unit', unit: INTL_UNIT[unit], unitDisplay })
}

export function unitCaption(value: number, unit: CountdownUnit): string {
	return new Intl.NumberFormat(getLocale().intl, { style: 'unit', unit: INTL_UNIT[unit], unitDisplay: 'long' })
		.formatToParts(value)
		.filter(part => part.type === 'unit')
		.map(part => part.value)
		.join('')
}

export function padded(value: number): string {
	return formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false })
}

export function clockText(parts: CountdownParts, units: readonly CountdownUnit[]): string {
	const clock = units.filter(unit => unit !== 'days').map(unit => padded(parts[unit]))
	const days = units.includes('days') && parts.days > 0 ? unitText(parts.days, 'days', 'short') : ''
	return [days, clock.join(':')].filter(Boolean).join(' ')
}

export function spokenTime(total: number, label: string): string {
	if (total <= 0) return formatMessage(UI_COUNTDOWN.REMAINING, { label, time: UI_COUNTDOWN.FINISHED })
	if (total < UNIT_MS.minutes) return formatMessage(UI_COUNTDOWN.REMAINING, { label, time: UI_COUNTDOWN.LESS_THAN_MINUTE })
	const parts = splitRemaining(Math.floor(total / UNIT_MS.minutes) * UNIT_MS.minutes, ['days', 'hours', 'minutes'])
	const time = (['days', 'hours', 'minutes'] as const)
		.filter(unit => parts[unit] > 0)
		.map(unit => unitText(parts[unit], unit, 'long'))
		.join(' ')
	return formatMessage(UI_COUNTDOWN.REMAINING, { label, time })
}
