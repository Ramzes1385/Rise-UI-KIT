import { getCurrentScope, onScopeDispose } from 'vue'

const FALLBACK_MS = 200

export function runWhenIdle(task: () => void): void {
	const hasIdle = typeof requestIdleCallback === 'function'
	const handle = hasIdle ? requestIdleCallback(task) : setTimeout(task, FALLBACK_MS)
	if (!getCurrentScope()) return
	onScopeDispose(() => (hasIdle ? cancelIdleCallback(handle as number) : clearTimeout(handle as ReturnType<typeof setTimeout>)))
}
