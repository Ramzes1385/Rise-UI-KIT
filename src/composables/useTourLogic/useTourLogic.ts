/** Composable: guided tour — навигация по шагам, геометрия подсветки, размещение тултипа */
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { UseTourLogicOptions, UseTourLogicReturn } from './useTourLogic.types'
import type { TourGeometry, TourPlacement, TourStep } from '@components/BaseTour/model/BaseTour.types'

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

function computeCardPosition(
	rect: DOMRect,
	placement: Exclude<TourPlacement, 'auto'>,
	gap: number,
): { top: number; left: number } {
	const centerX = rect.left + rect.width / 2
	const centerY = rect.top + rect.height / 2
	if (placement === 'top') return { top: rect.top - gap, left: centerX }
	if (placement === 'bottom') return { top: rect.bottom + gap, left: centerX }
	if (placement === 'left') return { top: centerY, left: rect.left - gap }
	return { top: centerY, left: rect.right + gap }
}

/** Composable для guided tour — навигация по шагам, геометрия подсветки, размещение тултипа. */
function useTourLogic(options: UseTourLogicOptions): UseTourLogicReturn {
	const { props, getIndex } = options

	const geometry = ref<TourGeometry | null>(null)

	const total = computed((): number => props.steps.length)
	const currentStep = computed((): TourStep | undefined => props.steps[getIndex()])
	const isFirst = computed((): boolean => getIndex() <= 0)
	const isLast = computed((): boolean => getIndex() >= total.value - 1)

	async function recalculate(): Promise<void> {
		await nextTick()
		const step = currentStep.value
		if (!step) {
			geometry.value = null
			return
		}

		if (props.behavior?.scrollIntoView !== false) {
			scrollTargetIntoView(step.target)
			await nextTick()
		}

		const rect = readTargetRect(step.target)
		if (!rect) {
			geometry.value = null
			return
		}

		const padding = props.padding ?? DEFAULT_PADDING
		const gap = props.gap ?? DEFAULT_GAP
		const preferred = step.placement ?? props.placement ?? 'auto'
		const placement = resolvePlacement(rect, preferred)

		geometry.value = {
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

	function handleViewportChange(): void {
		void recalculate()
	}

	function attachListeners(): void {
		window.addEventListener('resize', handleViewportChange)
		window.addEventListener('scroll', handleViewportChange, true)
	}

	function detachListeners(): void {
		window.removeEventListener('resize', handleViewportChange)
		window.removeEventListener('scroll', handleViewportChange, true)
	}

	watch(
		() => getIndex(),
		() => {
			void recalculate()
		},
	)

	if (getCurrentInstance()) {
		onBeforeUnmount(() => {
			detachListeners()
		})
	}

	return {
		geometry,
		currentStep,
		isFirst,
		isLast,
		total,
		recalculate,
		attachListeners,
		detachListeners,
	}
}

export { useTourLogic, DEFAULT_GAP, DEFAULT_PADDING, DEFAULT_RADIUS, resolvePlacement }
export type { UseTourLogicOptions, UseTourLogicReturn }
