import type { GanttDependencyType } from '../../types/BaseGantt.types'
import type { GanttArrow, GanttBox, GanttRowsSize, GanttRowWindow, GanttScrollView } from '../../types/BaseGanttModel.types'

const ARROW_GAP = 10
const ARROW_HEAD = 5
const ARROW_INSET = 1

function inside(x: number): number {
	return Math.max(x, ARROW_INSET)
}

export function rowWindow(view: GanttScrollView, rows: GanttRowsSize, overscan: number): GanttRowWindow {
	const { top, viewport } = view
	const { height, count } = rows
	const first = Math.floor(top / height) - overscan
	const last = Math.ceil((top + viewport) / height) + overscan
	return { start: Math.max(0, Math.min(first, count)), end: Math.max(0, Math.min(last, count)) }
}

function arrowHead(tip: { x: number; y: number }, direction: number): string {
	return `M${tip.x} ${tip.y}l${-direction * ARROW_HEAD} ${-ARROW_HEAD * 0.7}v${ARROW_HEAD * 1.4}z`
}

function verticalLane(x1: number, x2: number, route: { exit: number; side: number }): number | null {
	const lows = [route.exit > 0 ? x1 + ARROW_GAP : -Infinity, route.side > 0 ? x2 + ARROW_GAP : -Infinity]
	const highs = [route.exit < 0 ? x1 - ARROW_GAP : Infinity, route.side < 0 ? x2 - ARROW_GAP : Infinity]
	const low = Math.max(...lows)
	const high = Math.min(...highs)
	if (low > high) return null
	return Number.isFinite(low) ? low : high
}

export function dependencyArrow(from: GanttBox, to: GanttBox, link: { rowHeight: number; type: GanttDependencyType }): GanttArrow {
	const { rowHeight, type } = link
	const exit = type === 'FS' || type === 'FF' ? 1 : -1
	const side = type === 'FS' || type === 'SS' ? -1 : 1
	const x1 = exit > 0 ? from.x + from.width : from.x
	const y1 = from.row * rowHeight + rowHeight / 2
	const x2 = side < 0 ? Math.max(to.x, ARROW_HEAD) : to.x + to.width
	const y2 = to.row * rowHeight + rowHeight / 2
	const head = arrowHead({ x: x2, y: y2 }, -side)
	if (y1 === y2) return { line: `M${x1} ${y1}H${x2}`, head }
	const x = verticalLane(x1, x2, { exit, side })
	if (x !== null) return { line: `M${x1} ${y1}H${inside(x)}V${y2}H${x2}`, head }
	const lane = y1 + (y2 > y1 ? rowHeight / 2 : -rowHeight / 2)
	return { line: `M${x1} ${y1}H${inside(x1 + exit * ARROW_GAP)}V${lane}H${inside(x2 + side * ARROW_GAP)}V${y2}H${x2}`, head }
}
