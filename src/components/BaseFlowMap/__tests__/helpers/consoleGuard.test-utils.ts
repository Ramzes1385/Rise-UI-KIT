import { afterEach, beforeEach, expect, vi, type MockInstance } from 'vitest'

type ConsoleSpy = MockInstance<(...args: unknown[]) => void>

export interface ConsoleGuard {
	warn: () => ConsoleSpy
	error: () => ConsoleSpy
}

export function guardConsole(): ConsoleGuard {
	let spies: ConsoleSpy[] = []
	beforeEach(() => {
		spies = (['warn', 'error', 'log', 'info'] as const).map(
			method => vi.spyOn(console, method).mockImplementation(() => undefined) as ConsoleSpy,
		)
	})
	afterEach(() => {
		spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
		vi.restoreAllMocks()
	})
	return { warn: () => spies[0], error: () => spies[1] }
}
