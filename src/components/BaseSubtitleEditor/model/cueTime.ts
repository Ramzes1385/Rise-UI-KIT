const CUE_TIME = /^(?:(\d+):)?(?:(\d{1,2}):)?(\d{1,2}(?:[.,]\d{1,3})?|\d+(?:[.,]\d{1,3})?)$/

export function parseCueTime(value: string): number | null {
	const match = CUE_TIME.exec(value.trim())
	if (!match) return null
	const [, first, second, rest] = match
	const [hours, minutes] = second === undefined ? ['0', first ?? '0'] : [first, second]
	return Number(hours) * 3600 + Number(minutes) * 60 + Number(rest.replace(',', '.'))
}

export function formatCueTime(seconds: number): string {
	const total = Math.round(Math.max(seconds, 0) * 1000)
	const minutes = Math.floor(total / 60_000)
	const rest = ((total % 60_000) / 1000).toFixed(3).padStart(6, '0')
	return `${minutes}:${rest}`
}
