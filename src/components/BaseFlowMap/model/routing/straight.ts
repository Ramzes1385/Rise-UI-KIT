import { centerOf, clipToShape } from './shapes'
import type { FlowPoint, FlowRect } from '../../types/data/flowData.types'
import type { FlowLayoutEdge, FlowRouter } from '../../types/api/flowLayout.types'

function route(_edge: FlowLayoutEdge, context: { source: FlowRect; target: FlowRect; points?: FlowPoint[] }): FlowPoint[] {
	const middle = context.points ?? []
	const toward = middle[0] ?? centerOf(context.target)
	const back = middle[middle.length - 1] ?? centerOf(context.source)
	return [clipToShape('rect', context.source, toward), ...middle, clipToShape('rect', context.target, back)]
}

export const straightRouter: FlowRouter = { id: 'straight', route }
