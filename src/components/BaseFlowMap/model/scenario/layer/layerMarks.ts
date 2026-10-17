import type { FlowRoute } from '../../../types/api/flowLayout.types'
import { cachedRouteTable, readRoute } from '../particles/routeSampler'
import type { FlowTimelineEntry } from '../../../types/data/flowScenario.types'
import type { FlowMarksInput, FlowScenarioMarks, FlowTokenMark } from '../../../types/internal/flowScenarioLayer.types'

function progressOf(entry: FlowTimelineEntry, time: number): number {
	return entry.duration > 0 ? Math.min(1, Math.max(0, (time - entry.start) / entry.duration)) : 1
}

function markToken(entry: FlowTimelineEntry, route: FlowRoute, progress: number): FlowTokenMark | null {
	const table = cachedRouteTable(route.points)
	if (!table) {
		return null
	}
	const point = { x: 0, y: 0 }
	readRoute(table, progress * table.length, point)
	return { id: entry.step, x: point.x, y: point.y }
}

function isTravelling(entry: FlowTimelineEntry, input: FlowMarksInput, progress: number): boolean {
	return progress < 1 && !input.isReduced && entry.effect === 'travel'
}

function markEdge(entry: FlowTimelineEntry, input: FlowMarksInput, marks: FlowScenarioMarks): void {
	const route = entry.edge ? input.routes[entry.edge] : undefined
	if (!route) {
		return
	}
	const progress = progressOf(entry, input.time)
	const status = input.actions.get(entry.step)?.status
	const shown = progress >= 1 || input.isReduced || entry.effect === 'pulse' ? 1 : progress
	marks.trails.push({ id: entry.step, path: route.path, offset: 1 - shown, state: progress >= 1 ? 'done' : 'active', status })
	const token = isTravelling(entry, input, progress) ? markToken(entry, route, progress) : null
	if (token) {
		marks.tokens.push({ ...token, status })
	}
}

function markNode(entry: FlowTimelineEntry, input: FlowMarksInput, marks: FlowScenarioMarks): void {
	const rect = entry.node ? input.rects[entry.node] : undefined
	if (rect && progressOf(entry, input.time) < 1) {
		marks.pulses.push({ id: entry.step, rect, status: input.actions.get(entry.step)?.status })
	}
}

export function buildMarks(input: FlowMarksInput): FlowScenarioMarks {
	const marks: FlowScenarioMarks = { trails: [], tokens: [], pulses: [] }
	if (input.status === 'idle') {
		return marks
	}
	for (const entry of input.timeline) {
		if (input.time >= entry.start) {
			;(entry.edge ? markEdge : markNode)(entry, input, marks)
		}
	}
	return marks
}
