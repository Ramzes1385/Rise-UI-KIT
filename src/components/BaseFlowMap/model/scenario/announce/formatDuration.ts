import { formatNumber } from '@/locales/state'
import { UI_FLOW_SCENARIO } from '@/locales/messages'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function compose(value: number, sizes: readonly [number, number], names: readonly [string, string]): string {
	const head = `${formatNumber(Math.floor(value / sizes[0]))} ${names[0]}`
	const rest = Math.floor((value % sizes[0]) / sizes[1])
	return rest > 0 ? `${head} ${formatNumber(rest)} ${names[1]}` : head
}

export function formatDuration(ms: number): string {
	const value = Math.max(0, ms)
	if (value < SECOND) {
		return `${formatNumber(Math.round(value))} ${UI_FLOW_SCENARIO.UNIT_MS}`
	}
	if (value < MINUTE) {
		return `${formatNumber(Math.round(value / 100) / 10, { maximumFractionDigits: 1 })} ${UI_FLOW_SCENARIO.UNIT_S}`
	}
	if (value < HOUR) {
		return compose(value, [MINUTE, SECOND], [UI_FLOW_SCENARIO.UNIT_MIN, UI_FLOW_SCENARIO.UNIT_S])
	}
	if (value < DAY) {
		return compose(value, [HOUR, MINUTE], [UI_FLOW_SCENARIO.UNIT_H, UI_FLOW_SCENARIO.UNIT_MIN])
	}
	return compose(value, [DAY, HOUR], [UI_FLOW_SCENARIO.UNIT_D, UI_FLOW_SCENARIO.UNIT_H])
}
