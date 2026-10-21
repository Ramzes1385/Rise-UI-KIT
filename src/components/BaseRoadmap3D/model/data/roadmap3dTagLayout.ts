import type { Scene3DLabelSpot } from '@/scene3d/types/internal/scene3dInternal.types'
import type {
	Roadmap3DTag,
	Roadmap3DTagEntry,
	Roadmap3DTagForm,
	Roadmap3DTagRect,
	Roadmap3DTagSize,
} from '../../types/internal/roadmap3dInternal.types'

export const ROADMAP_3D_COMPACT_CLASS = 'base-roadmap-3d__tag--compact'
const LABEL_ID_SELECTOR = '[data-label-id]'
const LABEL_ID_ATTRIBUTE = 'data-label-id'

const RANK = { top: 0, goal: 1, neighbor: 2, stage: 3, start: 4 }

export function tagRank(tag: Roadmap3DTag, currentIndex: number): number {
	if (tag.isCurrent || tag.isSelected || tag.isFocused || tag.kind === 'topic') return RANK.top
	if (tag.kind === 'goal') return RANK.goal
	if (tag.kind === 'start') return RANK.start
	return Math.abs(tag.index - currentIndex) === 1 ? RANK.neighbor : RANK.stage
}

function rectOf(entry: Roadmap3DTagEntry, size: Roadmap3DTagSize): Roadmap3DTagRect {
	return { left: entry.x - size.width / 2, right: entry.x + size.width / 2, top: entry.y - size.height, bottom: entry.y }
}

function isFree(placed: Roadmap3DTagRect[], rect: Roadmap3DTagRect): boolean {
	return !placed.some(other => other.left < rect.right && other.right > rect.left && other.top < rect.bottom && other.bottom > rect.top)
}

export function resolveTagForms(entries: readonly Roadmap3DTagEntry[]): Map<string, Roadmap3DTagForm> {
	const forms = new Map<string, Roadmap3DTagForm>()
	const placed: Roadmap3DTagRect[] = []
	const ordered = [...entries].sort((a, b) => a.rank - b.rank || a.order - b.order)
	for (const entry of ordered) {
		const full = rectOf(entry, entry.full)
		if (!entry.isVisible) forms.set(entry.id, 'hidden')
		else if (entry.rank === RANK.top || isFree(placed, full)) {
			forms.set(entry.id, 'full')
			placed.push(full)
		} else if (entry.kind === 'stage') {
			forms.set(entry.id, 'compact')
			placed.push(rectOf(entry, entry.compact))
		} else forms.set(entry.id, 'hidden')
	}
	return forms
}

function sizeOf(element: HTMLElement): Roadmap3DTagSize {
	return { width: element.offsetWidth, height: element.offsetHeight }
}

export function layoutTags(layer: HTMLElement | null, tags: readonly Roadmap3DTag[], spots: ReadonlyMap<string, Scene3DLabelSpot>): void {
	const elements = new Map<string, HTMLElement>()
	layer
		?.querySelectorAll<HTMLElement>(LABEL_ID_SELECTOR)
		.forEach(element => elements.set(element.getAttribute(LABEL_ID_ATTRIBUTE) as string, element))
	const rows = tags.filter(tag => elements.has(tag.id) && spots.has(tag.id))
	const currentIndex = tags.find(tag => tag.isCurrent)?.index ?? -1
	rows.forEach(tag => elements.get(tag.id)!.classList.remove(ROADMAP_3D_COMPACT_CLASS))
	const full = new Map(rows.map(tag => [tag.id, sizeOf(elements.get(tag.id)!)]))
	rows.forEach(tag => tag.kind === 'stage' && elements.get(tag.id)!.classList.add(ROADMAP_3D_COMPACT_CLASS))
	const compact = new Map(rows.map(tag => [tag.id, sizeOf(elements.get(tag.id)!)]))
	const forms = resolveTagForms(
		rows.map((tag, order) => {
			const spot = spots.get(tag.id)!
			return {
				id: tag.id,
				kind: tag.kind,
				rank: tagRank(tag, currentIndex),
				order,
				x: spot.x,
				y: spot.y,
				full: full.get(tag.id)!,
				compact: compact.get(tag.id)!,
				isVisible: spot.isVisible,
			}
		}),
	)
	rows.forEach(tag => {
		const element = elements.get(tag.id)!
		const form = forms.get(tag.id)
		element.classList.toggle(ROADMAP_3D_COMPACT_CLASS, form === 'compact')
		element.style.visibility = form === 'hidden' ? 'hidden' : 'visible'
	})
}
