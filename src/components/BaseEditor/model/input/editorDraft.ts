const MAX_PENDING_VALUES = 32

export function rememberEmitted(pending: string[], value: string): void {
	pending.push(value)
	if (pending.length > MAX_PENDING_VALUES) pending.shift()
}

export function consumeEcho(pending: string[], value: string): boolean {
	const index = pending.indexOf(value)
	if (index < 0) {
		pending.length = 0
		return false
	}
	pending.splice(0, index + 1)
	return true
}
