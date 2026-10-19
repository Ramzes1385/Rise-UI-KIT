import type { FlowSize } from '../../../types/data/flowData.types'

export const HEADER_TOP = -6
const HEADER_BOTTOM = 28
const DASH = 6
const GAP = 5
const RADIUS = 6
const TAB_WIDTH = 44
const TAB_HEIGHT = 22
const TAB_CUT = 6

function header(width: number): string {
	const r = RADIUS
	return `M${r} ${HEADER_TOP}H${width - r}Q${width} ${HEADER_TOP} ${width} ${HEADER_TOP + r}V${HEADER_BOTTOM - r}Q${width} ${HEADER_BOTTOM} ${width - r} ${HEADER_BOTTOM}H${r}Q0 ${HEADER_BOTTOM} 0 ${HEADER_BOTTOM - r}V${HEADER_TOP + r}Q0 ${HEADER_TOP} ${r} ${HEADER_TOP}Z`
}

function dashes(x: number, from: number, to: number): string {
	const parts: string[] = []
	for (let y = from; y < to; y += DASH + GAP) parts.push(`M${x} ${y}V${Math.min(y + DASH, to)}`)
	return parts.join('')
}

export function lifelinePath({ width, height }: FlowSize): string {
	return header(width) + dashes(width / 2, HEADER_BOTTOM, height)
}

export function fragmentPath({ width, height }: FlowSize): string {
	const frame = `M0 0H${width}V${height}H0Z`
	const tab = `M0 0H${TAB_WIDTH}V${TAB_HEIGHT - TAB_CUT}L${TAB_WIDTH - TAB_CUT} ${TAB_HEIGHT}H0Z`
	return frame + tab
}
