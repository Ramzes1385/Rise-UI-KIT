import { vi } from 'vitest'

export interface FakeFrames {
	frame: (ms?: number) => void
	run: (total: number, step?: number) => void
	pending: () => number
	restore: () => void
}

export function installFakeFrames(options: { ignoreCancel?: boolean } = {}): FakeFrames {
	let now = 0
	let counter = 0
	const queue = new Map<number, (time: number) => void>()
	vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => {
		counter += 1
		queue.set(counter, callback)
		return counter
	})
	vi.stubGlobal('cancelAnimationFrame', (id: number) => {
		if (!options.ignoreCancel) {
			queue.delete(id)
		}
	})
	const frame = (ms = 16) => {
		now += ms
		const callbacks = [...queue.values()]
		queue.clear()
		callbacks.forEach(callback => callback(now))
	}
	return {
		frame,
		run(total, step = 16) {
			for (let spent = 0; spent < total; spent += step) {
				frame(step)
			}
		},
		pending: () => queue.size,
		restore: () => vi.unstubAllGlobals(),
	}
}
