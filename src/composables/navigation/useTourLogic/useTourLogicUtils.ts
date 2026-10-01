/** Утилиты: геометрия тура — поиск цели, прокрутка к ней, выбор стороны и положение карточки */
import type { BaseTourProps, TourGeometry, TourPlacement, TourStep } from '@components/BaseTour/types/BaseTour.types'

const DEFAULT_GAP = 12
const DEFAULT_PADDING = 8
const DEFAULT_RADIUS = 8

function readTargetRect(selector: string): DOMRect | null {
	const element = document.querySelector(selector)
	if (!element) return null
	return element.getBoundingClientRect()
}

function scrollTargetIntoView(selector: string): void {
	const element = document.querySelector(selector)
	if (!element || typeof element.scrollIntoView !== 'function') return
	element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
}

function resolvePlacement(rect: DOMRect, preferred: TourPlacement): Exclude<TourPlacement, 'auto'> {
	if (preferred !== 'auto') return preferred
	const spaceBelow = window.innerHeight - rect.bottom
	const spaceAbove = rect.top
	const spaceRight = window.innerWidth - rect.right
	const spaceLeft = rect.left
	const max = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft)
	if (max === spaceBelow) return 'bottom'
	if (max === spaceAbove) return 'top'
	if (max === spaceRight) return 'right'
	return 'left'
}

function computeCardPosition(rect: DOMRect, placement: Exclude<TourPlacement, 'auto'>, gap: number): { top: number; left: number } {
	const centerX = rect.left + rect.width / 2
	const centerY = rect.top + rect.height / 2
	if (placement === 'top') return { top: rect.top - gap, left: centerX }
	if (placement === 'bottom') return { top: rect.bottom + gap, left: centerX }
	if (placement === 'left') return { top: centerY, left: rect.left - gap }
	return { top: centerY, left: rect.right + gap }
}

/** Подсветка вокруг цели с отступом padding и карточка на расстоянии gap с выбранной стороны */
function buildTourGeometry(rect: DOMRect, step: TourStep, props: BaseTourProps): TourGeometry {
	const padding = props.padding ?? DEFAULT_PADDING
	const gap = props.gap ?? DEFAULT_GAP
	const preferred = step.placement ?? props.placement ?? 'auto'
	const placement = resolvePlacement(rect, preferred)

	return {
		spotlight: {
			top: rect.top - padding,
			left: rect.left - padding,
			width: rect.width + padding * 2,
			height: rect.height + padding * 2,
		},
		card: computeCardPosition(rect, placement, gap),
		placement,
	}
}

export { DEFAULT_GAP, DEFAULT_PADDING, DEFAULT_RADIUS, readTargetRect, scrollTargetIntoView, resolvePlacement, buildTourGeometry }
