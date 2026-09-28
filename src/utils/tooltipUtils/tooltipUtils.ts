/** Утилиты: позиционирование тултипа относительно триггера, переворот и сдвиг у края окна */

import type { TooltipLayout, TooltipPosition, TooltipPositionOptions } from './tooltipUtils.types'

/** Отступ подсказки от края окна при сдвиге, px */
const TOOLTIP_VIEWPORT_MARGIN = 8

const OPPOSITE: Record<TooltipPosition, TooltipPosition> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

function isVertical(position: TooltipPosition): boolean {
	return position === 'top' || position === 'bottom'
}

/**
 * Рассчитать CSS-координаты тултипа относительно триггера: точка у середины стороны триггера,
 * подсказку от неё отодвигает `translate` в стилях. `shift` сдвигает точку вдоль края окна.
 */
function calcTooltipPosition(options: TooltipPositionOptions): Record<string, string> {
	const { position, coords } = options
	const gap = options.gap ?? 8
	const shift = options.shift ?? 0
	const { top, left, width, height } = coords

	switch (position) {
		case 'top':
			return {
				top: `${top - gap}px`,
				left: `${left + width / 2 + shift}px`,
			}
		case 'bottom':
			return {
				top: `${top + height + gap}px`,
				left: `${left + width / 2 + shift}px`,
			}
		case 'left':
			return {
				top: `${top + height / 2 + shift}px`,
				left: `${left - gap}px`,
			}
		case 'right':
			return {
				top: `${top + height / 2 + shift}px`,
				left: `${left + width + gap}px`,
			}
		default:
			return {}
	}
}

/** Свободное место от триггера до края окна со стороны `side` */
function spaceOn(side: TooltipPosition, layout: TooltipLayout, gap: number): number {
	const { coords, viewport } = layout
	switch (side) {
		case 'top':
			return coords.top - gap
		case 'bottom':
			return viewport.height - coords.top - coords.height - gap
		case 'left':
			return coords.left - gap
		case 'right':
			return viewport.width - coords.left - coords.width - gap
	}
}

/**
 * Сторона подсказки: выбранная, если подсказка там помещается; иначе противоположная, если помещается там.
 * Пока размер подсказки не измерен (0), остаётся выбранная.
 *
 * @example
 * const coords = { top: 4, left: 100, width: 80, height: 32 }
 * resolveTooltipPlacement('top', { coords, size: { width: 120, height: 24 }, viewport: { width: 1024, height: 768 } }) // 'bottom'
 */
function resolveTooltipPlacement(position: TooltipPosition, layout: TooltipLayout, gap = 8): TooltipPosition {
	const { size } = layout
	if (!size.width || !size.height) return position
	const need = (isVertical(position) ? size.height : size.width) + TOOLTIP_VIEWPORT_MARGIN
	const fits = (side: TooltipPosition): boolean => spaceOn(side, layout, gap) >= need
	return fits(position) || !fits(OPPOSITE[position]) ? position : OPPOSITE[position]
}

/**
 * Сдвиг подсказки вдоль края окна, px: подсказка по центру триггера не выходит за окно (отступ 8px).
 * Для top/bottom — по горизонтали, для left/right — по вертикали; стрелку стили сдвигают обратно на столько же.
 */
function calcTooltipShift(placement: TooltipPosition, layout: TooltipLayout): number {
	const { coords, size, viewport } = layout
	if (!size.width || !size.height) return 0
	const vertical = isVertical(placement)
	const center = vertical ? coords.left + coords.width / 2 : coords.top + coords.height / 2
	const half = (vertical ? size.width : size.height) / 2
	const limit = vertical ? viewport.width : viewport.height
	const clamped = Math.max(TOOLTIP_VIEWPORT_MARGIN + half, Math.min(center, limit - TOOLTIP_VIEWPORT_MARGIN - half))
	return clamped - center
}

/** Получить имя CSS-перехода по позиции тултипа */
function getTooltipTransition(position: string): string {
	return `tooltip-${position}`
}

export { calcTooltipPosition, calcTooltipShift, getTooltipTransition, resolveTooltipPlacement, TOOLTIP_VIEWPORT_MARGIN }
