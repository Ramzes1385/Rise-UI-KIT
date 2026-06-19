/** Утилиты: позиционирование тултипа относительно триггера */

import type { TooltipPositionOptions } from './tooltipUtils.types'

/** Рассчитать CSS-координаты тултипа относительно триггера */
function calcTooltipPosition(options: TooltipPositionOptions): Record<string, string> {
	const { position, coords } = options
	const gap = options.gap ?? 8
	const { top, left, width, height } = coords

	switch (position) {
		case 'top':
			return {
				top: `${top - gap}px`,
				left: `${left + width / 2}px`,
			}
		case 'bottom':
			return {
				top: `${top + height + gap}px`,
				left: `${left + width / 2}px`,
			}
		case 'left':
			return {
				top: `${top + height / 2}px`,
				left: `${left - gap}px`,
			}
		case 'right':
			return {
				top: `${top + height / 2}px`,
				left: `${left + width + gap}px`,
			}
		default:
			return {}
	}
}

/** Получить имя CSS-перехода по позиции тултипа */
function getTooltipTransition(position: string): string {
	return `tooltip-${position}`
}

export { calcTooltipPosition, getTooltipTransition }
