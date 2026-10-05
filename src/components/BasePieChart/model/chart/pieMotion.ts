import type { PieSegmentRender, PieSegmentView } from '../../types/BasePieChart.types'

const COLLAPSED_DASH = '0 100'

function toRender(view: PieSegmentView, entry: PieSegmentRender['entry']): PieSegmentRender {
	return { ...view, entry, enter: { start: view.start / 100, share: view.percent / 100 }, isLeaving: false }
}

export function initialSegments(views: readonly PieSegmentView[], isSweep: boolean): PieSegmentRender[] {
	return views.map(view => toRender(view, isSweep ? 'sweep' : 'static'))
}

function collapse(segment: PieSegmentRender): PieSegmentRender {
	return segment.isLeaving ? segment : { ...segment, dash: COLLAPSED_DASH, isLeaving: true }
}

export function mergeSegments(
	previous: readonly PieSegmentRender[],
	views: readonly PieSegmentView[],
	options: { isAnimated: boolean },
): PieSegmentRender[] {
	const known = new Map(previous.map(segment => [segment.label, segment]))
	const next = views.map(view => {
		const old = known.get(view.label)
		if (!old) return toRender(view, options.isAnimated ? 'added' : 'static')
		return { ...view, entry: old.entry, enter: old.enter, isLeaving: false }
	})
	if (!options.isAnimated) return next
	const labels = new Set(views.map(view => view.label))
	previous.forEach((segment, index) => {
		if (!labels.has(segment.label)) next.splice(Math.min(index, next.length), 0, collapse(segment))
	})
	return next
}

export function cssTimeToMs(value: string): number {
	const times = value.split(',').map(part => {
		const time = Number.parseFloat(part)
		if (Number.isNaN(time)) return 0
		return part.trim().endsWith('ms') ? time : time * 1000
	})
	return Math.max(0, ...times)
}
