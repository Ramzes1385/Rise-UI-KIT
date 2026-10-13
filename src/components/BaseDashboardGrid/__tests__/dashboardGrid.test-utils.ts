import { vi } from 'vitest'
import type { DashboardLayoutItem } from '../types/BaseDashboardGrid.types'

export const GRID_PROPS = { cols: 4, gap: 0, rowHeight: 100 } as const

export const makeLayout = (): DashboardLayoutItem[] => [
	{ id: 'a', x: 0, y: 0, w: 2, h: 2, label: 'Выручка' },
	{ id: 'b', x: 2, y: 0, w: 2, h: 2, label: 'Заказы' },
]

export function mockGridWidth(width: number): void {
	vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(width)
}

export function mockPointerCapture(): ReturnType<typeof vi.fn> {
	const capture = vi.fn()
	Element.prototype.setPointerCapture = capture
	return capture
}

export function pointer(clientX: number, clientY: number, extra: { pointerId?: number; pointerType?: string } = {}) {
	return { clientX, clientY, pointerId: 1, pointerType: 'mouse', button: 0, ...extra }
}

export function lastCall<T>(mock: { mock: { calls: T[][] } }): T {
	return mock.mock.calls[mock.mock.calls.length - 1][0]
}
