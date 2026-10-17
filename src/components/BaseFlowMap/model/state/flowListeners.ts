const LISTENER_KEY = /^on[A-Z]/

function toEventName(key: string): string {
	const name = key.slice(2)
	if (name.startsWith('Update:')) return `update:${name.slice('Update:'.length)}`
	return name.replace(/[A-Z]/g, (char, index: number) => (index === 0 ? char.toLowerCase() : `-${char.toLowerCase()}`))
}

export function readListeners(vnodeProps: Record<string, unknown> | null | undefined): Record<string, unknown> {
	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(vnodeProps ?? {})) {
		if (LISTENER_KEY.test(key) && typeof value === 'function') result[toEventName(key)] = value
	}
	return result
}
