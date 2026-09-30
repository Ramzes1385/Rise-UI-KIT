/** Composable: стрелка карточки тура к подсвеченному элементу и сдвиг карточки внутрь окна */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { TourGeometry } from '@components/BaseTour/types/BaseTour.types'
import type { TourArrowSide, TourCardBox, TourCardFit, TourViewport, UseTourArrowOptions } from './types/useTourArrow.types'

/** Отступ карточки от края окна, px */
export const TOUR_VIEWPORT_MARGIN = 8

/** Ближе к углу карточки стрелка не подходит: иначе она вылезает за скругление, px */
export const TOUR_ARROW_EDGE_OFFSET = 16

const ARROW_SIDE: Record<TourGeometry['placement'], TourArrowSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

const NO_ARROW: TourCardFit = { side: null, shift: 0, offset: 0 }

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max))
}

/** Сдвиг отрезка [start, start + length] внутрь [0, limit] с отступом; не влезает — прижимается к началу */
function shiftInside(start: number, length: number, limit: number): number {
	const max = Math.max(TOUR_VIEWPORT_MARGIN, limit - length - TOUR_VIEWPORT_MARGIN)
	return clamp(start, TOUR_VIEWPORT_MARGIN, max) - start
}

/** Место стрелки на крае длиной `length`, если середина цели — в точке `target` от начала края */
function arrowOffset(target: number, length: number): number {
	if (length < TOUR_ARROW_EDGE_OFFSET * 2) return length / 2
	return clamp(target, TOUR_ARROW_EDGE_OFFSET, length - TOUR_ARROW_EDGE_OFFSET)
}

function targetCenter(geometry: TourGeometry): { x: number; y: number } {
	const { top, left, width, height } = geometry.spotlight
	return { x: left + width / 2, y: top + height / 2 }
}

/**
 * Карточка у цели: точка карточки — середина её края у цели. Вдоль этого края карточка сдвигается внутрь окна,
 * стрелка остаётся напротив середины цели
 */
export function fitDesktopCard(geometry: TourGeometry, box: TourCardBox, viewport: TourViewport): TourCardFit {
	const side = ARROW_SIDE[geometry.placement]
	const center = targetCenter(geometry)
	if (side === 'top' || side === 'bottom') {
		const start = geometry.card.left - box.width / 2
		const shift = shiftInside(start, box.width, viewport.width)
		return { side, shift, offset: arrowOffset(center.x - start - shift, box.width) }
	}
	const start = geometry.card.top - box.height / 2
	const shift = shiftInside(start, box.height, viewport.height)
	return { side, shift, offset: arrowOffset(center.y - start - shift, box.height) }
}

/** Мобильная карточка прижата к низу окна: стрелка на её верхнем крае, если цель выше карточки */
export function fitMobileCard(geometry: TourGeometry, box: TourCardBox): TourCardFit {
	const center = targetCenter(geometry)
	if (center.y >= box.top) return NO_ARROW
	return { side: 'top', shift: 0, offset: arrowOffset(center.x - box.left, box.width) }
}

function readViewport(): TourViewport {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function readBox(card: HTMLElement): TourCardBox {
	return { width: card.offsetWidth, height: card.offsetHeight, left: card.offsetLeft, top: card.offsetTop }
}

function useCardMeasure(options: UseTourArrowOptions) {
	const box = ref<TourCardBox | null>(null)
	const viewport = ref<TourViewport>(readViewport())
	let observer: ResizeObserver | null = null

	function measure(): void {
		const card = options.cardRef.value
		box.value = card ? readBox(card) : null
		viewport.value = readViewport()
	}

	function observe(card: HTMLElement | null): void {
		observer?.disconnect()
		observer = null
		measure()
		if (!card) return
		observer = new ResizeObserver(measure)
		observer.observe(card)
	}

	watch(options.cardRef, observe)
	watch([options.geometry, options.isMobile], () => nextTick(measure))
	onBeforeUnmount(() => observer?.disconnect())
	return { box, viewport }
}

/**
 * Стрелка карточки тура. Карточка у цели сдвигается вдоль края цели внутрь окна, стрелка на её крае остаётся
 * напротив середины цели; сторона стрелки меняется вместе со стороной карточки. На мобильном карточка прижата
 * к низу окна — стрелка на её верхнем крае смотрит на цель, если цель выше карточки
 *
 * @example
 * ```ts
 * const { arrowSide, arrowStyle } = useTourArrow({ cardRef, geometry, isMobile })
 * ```
 */
export function useTourArrow(options: UseTourArrowOptions) {
	const { box, viewport } = useCardMeasure(options)

	const fit = computed((): TourCardFit => {
		const geometry = options.geometry.value
		if (!geometry || !box.value || box.value.width === 0) return NO_ARROW
		if (options.isMobile.value) return fitMobileCard(geometry, box.value)
		return fitDesktopCard(geometry, box.value, viewport.value)
	})

	return {
		fit,
		arrowSide: computed((): TourArrowSide | null => fit.value.side),
		arrowStyle: computed((): Record<string, string> => ({
			'--tour-card-shift': `${fit.value.shift}px`,
			'--tour-arrow-offset': `${fit.value.offset}px`,
		})),
	}
}
