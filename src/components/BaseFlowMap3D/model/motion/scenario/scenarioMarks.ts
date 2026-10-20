import { sampleTrack } from '../particles/edgeTracks'
import type { FlowTimelineEntry } from '@components/BaseFlowMap/types/data/flowScenario.types'
import type {
	FlowMap3DArrival,
	FlowMap3DArrivalWindow,
	FlowMap3DMarksInput,
	FlowMap3DScenarioMarks,
} from '../../../types/internal/flowMap3dMotion.types'

function progressOf(entry: FlowTimelineEntry, time: number): number {
	return entry.duration > 0 ? Math.min(1, Math.max(0, (time - entry.start) / entry.duration)) : 1
}

function markOf(entry: FlowTimelineEntry, input: FlowMap3DMarksInput, edge: string): FlowMap3DScenarioMarks {
	const marks: FlowMap3DScenarioMarks = { tokens: [], trails: [] }
	const track = input.tracks.get(edge)
	if (!track || input.time < entry.start) return marks
	const progress = progressOf(entry, input.time)
	const status = input.actions.get(entry.step)?.status
	const isFull = progress >= 1 || input.isReduced || entry.effect === 'pulse'
	marks.trails.push({ step: entry.step, edge, shown: isFull ? 1 : progress, isDone: progress >= 1, status })
	if (progress < 1 && !input.isReduced && entry.effect === 'travel') {
		const spot = { x: 0, y: 0, z: 0 }
		sampleTrack(track, progress * track.total, spot)
		marks.tokens.push({ step: entry.step, edge, ...spot, status })
	}
	return marks
}

export function buildScenarioMarks(input: FlowMap3DMarksInput): FlowMap3DScenarioMarks {
	const marks: FlowMap3DScenarioMarks = { tokens: [], trails: [] }
	if (input.status === 'idle') return marks
	input.timeline.forEach(entry => {
		if (!entry.edge) return
		const mark = markOf(entry, input, entry.edge)
		marks.tokens.push(...mark.tokens)
		marks.trails.push(...mark.trails)
	})
	return marks
}

export function findArrivals(window: FlowMap3DArrivalWindow): FlowMap3DArrival[] {
	if (window.to <= window.from) return []
	return window.timeline.flatMap(entry => {
		const node = entry.edge ? window.targets.get(entry.edge) : entry.node
		const moment = entry.edge ? entry.start + entry.duration : entry.start
		if (!node || moment <= window.from || moment > window.to) return []
		return [{ step: entry.step, node, animation: window.actions.get(entry.step)?.model3d?.animation }]
	})
}
