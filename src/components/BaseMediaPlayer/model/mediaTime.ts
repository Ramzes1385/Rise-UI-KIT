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
