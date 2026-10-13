import type { GanttArrow, GanttBox, GanttRowsSize, GanttRowWindow, GanttScrollView } from '../../types/BaseGanttModel.types'

const ARROW_GAP = 10
const ARROW_HEAD = 5

export function rowWindow(view: GanttScrollView, rows: GanttRowsSize, overscan: number): GanttRowWindow {
	const { top, viewport } = view
	const { height, count } = rows
	const first = Math.floor(top / height) - overscan
	const last = Math.ceil((top + viewport) / height) + overscan
	return { start: Math.max(0, Math.min(first, count)), end: Math.max(0, Math.min(last, count)) }
}

export function dependencyArrow(from: GanttBox, to: GanttBox, rowHeight: number): GanttArrow {
	const x1 = from.x + from.width
	const y1 = from.row * rowHeight + rowHeight / 2
	const x2 = to.x
	const y2 = to.row * rowHeight + rowHeight / 2
	const head = `M${x2} ${y2}l${-ARROW_HEAD} ${-ARROW_HEAD * 0.7}v${ARROW_HEAD * 1.4}z`
	if (y1 === y2) return { line: `M${x1} ${y1}H${x2}`, head }
	if (x2 - x1 >= ARROW_GAP * 2) return { line: `M${x1} ${y1}H${x1 + ARROW_GAP}V${y2}H${x2}`, head }
	const lane = y1 + (y2 > y1 ? rowHeight / 2 : -rowHeight / 2)
	return { line: `M${x1} ${y1}H${x1 + ARROW_GAP}V${lane}H${x2 - ARROW_GAP}V${y2}H${x2}`, head }
}
