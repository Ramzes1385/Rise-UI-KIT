import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { markGlyph } from '../data/reviewDiff'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { initialsOf } from '../data/reviewSuggestions'
import type { FlowMapContext } from '../../../types/internal/flowModel.types'
import type { ReviewMark } from '../../../types/internal/review/reviewCore.types'
import type { ReviewScene } from '../../../types/internal/review/reviewState.types'
import type { FlowReviewState } from '../../../types/internal/review/reviewState.types'
import type { FlowEdge, FlowNode, FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { ReviewDrawable, ReviewPin } from '../../../types/internal/review/reviewLayer.types'
import { pinAnchor, centerOf, edgeNeighbour, ghostSize, glyphAt, linePath, pathMid, placeGhost } from './reviewGeometry'

const DEFAULT_SIZE = { width: 180, height: 64 }

function isGhostNode(map: FlowMapContext, mark: ReviewMark): boolean {
	const isPlain = mark.kind === 'add' || mark.kind === 'remove'
	return mark.entity === 'node' && isPlain && Boolean(mark.value) && !map.model.layout.value.nodes[mark.id]
}

function placeGhosts(map: FlowMapContext, marks: readonly ReviewMark[]): Map<string, FlowRect> {
	const { model } = map
	const known = new Map<string, FlowRect>(Object.entries(model.layout.value.nodes))
	const edges = marks.filter(mark => mark.entity === 'edge' && mark.value).map(mark => mark.value as FlowEdge)
	const ghosts = new Map<string, FlowRect>()
	for (const mark of marks.filter(item => isGhostNode(map, item))) {
		const node = mark.value as FlowNode
		const size = ghostSize(node, model.nodeKind(node).size ?? DEFAULT_SIZE)
		const neighbour = edgeNeighbour(edges, node.id, known)
		const rect = placeGhost(node, { size, neighbour, bounds: model.layout.value.bounds })
		ghosts.set(node.id, rect)
		known.set(node.id, rect)
	}
	return ghosts
}

function nodeRect(scene: ReviewScene, id: string): FlowRect | undefined {
	return scene.ghosts.get(id) ?? scene.map.model.layout.value.nodes[id]
}

function titleOf(mark: ReviewMark, text: string): string {
	return formatMessage(UI_FLOW_REVIEW[`MARK_${mark.kind.toUpperCase()}` as 'MARK_ADD'], { name: text })
}

function labelOf(mark: ReviewMark, scene: ReviewScene): string {
	const value = mark.value as { label?: string; source?: string; target?: string } | undefined
	if (value?.label) return value.label
	const node = scene.map.model.data.value.nodes.find(item => item.id === mark.id)
	return node?.label ?? scene.map.model.data.value.edges.find(item => item.id === mark.id)?.label ?? mark.id
}

function base(mark: ReviewMark, scene: ReviewScene, focus: string | null): Omit<ReviewDrawable, 'glyphPoint'> {
	return {
		key: `${mark.suggestionId ?? 'x'}:${mark.key}`,
		kind: mark.kind,
		suggestionId: mark.suggestionId,
		glyph: markGlyph(mark.kind),
		author: mark.author,
		title: titleOf(mark, labelOf(mark, scene)),
		fields: mark.fields,
		isHot: focus !== null && mark.suggestionId === focus,
		isGhost: false,
	}
}

function nodeDrawable(mark: ReviewMark, scene: ReviewScene, focus: string | null): ReviewDrawable | null {
	const current = scene.map.model.layout.value.nodes[mark.id]
	const ghost = scene.ghosts.get(mark.id)
	const rect = ghost ?? current
	if (!rect) return null
	const common = base(mark, scene, focus)
	if (mark.kind === 'move') return moveDrawable(common, mark, current)
	return { ...common, rect, glyphPoint: glyphAt(rect), isGhost: Boolean(ghost), text: ghost ? labelOf(mark, scene) : undefined }
}

function moveDrawable(common: Omit<ReviewDrawable, 'glyphPoint'>, mark: ReviewMark, current: FlowRect | undefined): ReviewDrawable | null {
	const position = mark.fields.find(item => item.field === 'position')?.after as FlowPoint | undefined
	if (!current || !position) return null
	const rect = { ...current, x: position.x, y: position.y }
	return { ...common, rect, from: centerOf(current), glyphPoint: glyphAt(rect) }
}

function edgeDrawable(mark: ReviewMark, scene: ReviewScene, focus: string | null): ReviewDrawable | null {
	const common = base(mark, scene, focus)
	const route = scene.map.model.routes.value[mark.id]
	if (!route && mark.value) {
		const edge = mark.value as FlowEdge
		const source = nodeRect(scene, edge.source)
		const target = nodeRect(scene, edge.target)
		if (!source || !target) return null
		const mid = pathMid({ path: '', points: [centerOf(source), centerOf(target)], label: null }) as FlowPoint
		return { ...common, path: linePath(source, target), isGhost: true, glyphPoint: mid }
	}
	const mid = pathMid(route)
	return route && mid ? { ...common, path: route.path, glyphPoint: mid } : null
}

function groupDrawable(mark: ReviewMark, scene: ReviewScene, focus: string | null): ReviewDrawable | null {
	const rect = scene.map.model.layout.value.groups[mark.id]
	return rect ? { ...base(mark, scene, focus), rect, glyphPoint: glyphAt(rect) } : null
}

function drawableOf(mark: ReviewMark, scene: ReviewScene, focus: string | null): ReviewDrawable | null {
	if (mark.entity === 'node') return nodeDrawable(mark, scene, focus)
	if (mark.entity === 'edge') return edgeDrawable(mark, scene, focus)
	return mark.entity === 'group' ? groupDrawable(mark, scene, focus) : null
}

export function useReviewDrawables(map: FlowMapContext, review: FlowReviewState): ComputedRef<ReviewDrawable[]> {
	return computed(() => {
		const marks = review.marks.value
		const scene: ReviewScene = { map, marks, ghosts: placeGhosts(map, marks) }
		const focus = review.suggestions.focusId.value
		return marks.flatMap(mark => drawableOf(mark, scene, focus) ?? [])
	})
}

export function useReviewPins(map: FlowMapContext, review: FlowReviewState): ComputedRef<ReviewPin[]> {
	return computed(() => {
		if (!review.isActive.value) return []
		const { model, viewport } = map
		const scene = { ...model.layout.value, routes: model.routes.value }
		return review.comments.visible.value.flatMap(thread => {
			const anchor = pinAnchor(thread, { nodes: scene.nodes, groups: scene.groups, routes: scene.routes })
			if (!anchor) return []
			const first = thread.comments[0]
			const { x, y, zoom } = viewport.value
			const name = first?.author.name ?? ''
			const label = formatMessage(UI_FLOW_REVIEW.PIN_LABEL, { name, count: thread.comments.length })
			return [
				{
					thread,
					x: x + anchor.x * zoom,
					y: y + anchor.y * zoom,
					count: thread.comments.length,
					initials: initialsOf(name),
					label,
				},
			]
		})
	})
}
