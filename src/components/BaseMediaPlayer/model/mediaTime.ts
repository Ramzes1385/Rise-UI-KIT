const SECONDS_IN_HOUR = 3600

function pad(value: number): string {
	return String(value).padStart(2, '0')
}

export function formatMediaTime(seconds: number, reference = seconds): string {
	const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
	const hours = Math.floor(total / SECONDS_IN_HOUR)
	const minutes = Math.floor((total % SECONDS_IN_HOUR) / 60)
	const rest = pad(total % 60)
	const hasHours = hours > 0 || (Number.isFinite(reference) && reference >= SECONDS_IN_HOUR)
	return hasHours ? `${hours}:${pad(minutes)}:${rest}` : `${minutes}:${rest}`
}

const UNIT_SECONDS: Record<string, number> = { h: 3600, m: 60, s: 1 }

export function parseMediaTime(value: string | null): number | null {
	const text = value?.trim() ?? ''
	if (/^\d+(\.\d+)?$/.test(text)) return Number(text)
	if (/^\d+(:\d{1,2}){1,2}$/.test(text)) return text.split(':').reduce((total, part) => total * 60 + Number(part), 0)
	const units = /^(\d+h)?(\d+m)?(\d+s)?$/.exec(text)
	if (!text || !units) return null
	return units.slice(1).reduce((total, part) => (part ? total + Number(part.slice(0, -1)) * UNIT_SECONDS[part.slice(-1)] : total), 0)
}
