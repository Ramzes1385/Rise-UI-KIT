import type { FlowEditPort } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowPort, FlowPortSide, FlowPoint, FlowRect } from '../../../types/data/flowData.types'

const SIDES: FlowPortSide[] = ['top', 'right', 'bottom', 'left']

function pointOnSide(rect: FlowRect, side: FlowPortSide, offset = 0.5): FlowPoint {
	if (side === 'top') return { x: rect.x + rect.width * offset, y: rect.y }
	if (side === 'bottom') return { x: rect.x + rect.width * offset, y: rect.y + rect.height }
	if (side === 'left') return { x: rect.x, y: rect.y + rect.height * offset }
	return { x: rect.x + rect.width, y: rect.y + rect.height * offset }
}

export function portsOf(declared: readonly FlowPort[] | undefined, rect: FlowRect): FlowEditPort[] {
	if (declared && declared.length > 0) {
		return declared.map(port => ({
			id: port.id,
			side: port.side ?? 'right',
			point: pointOnSide(rect, port.side ?? 'right', port.offset),
			label: port.label,
		}))
	}
	return SIDES.map(side => ({ id: '', side, point: pointOnSide(rect, side) }))
}
