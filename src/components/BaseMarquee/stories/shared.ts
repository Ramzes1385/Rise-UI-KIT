import type { BaseMarqueeProps } from '../types/BaseMarquee.types'
export const NEWS = [
	'Курс рубля укрепился',
	'Новая линия метро открыта',
	'Завтра без осадков, до +18°',
	'Итоги квартала — в отчёте',
] as const

export const LOGOS = [
	{ name: 'Северный ветер', icon: 'star' },
	{ name: 'Сфера', icon: 'bell' },
	{ name: 'Кварц', icon: 'settings' },
	{ name: 'Полюс', icon: 'link' },
	{ name: 'Орбита', icon: 'calendar' },
	{ name: 'Маяк', icon: 'email' },
] as const

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function emulateReducedMotion(isReduced: boolean): () => () => void {
	return () => {
		const original = window.matchMedia
		window.matchMedia = (query: string) =>
			query === REDUCED_MOTION_QUERY
				? ({
						...original.call(window, query),
						matches: isReduced,
						addEventListener() {},
						removeEventListener() {},
					} as MediaQueryList)
				: original.call(window, query)
		return () => {
			window.matchMedia = original
		}
	}
}

export type MarqueeStoryArgs = BaseMarqueeProps<string> & {
	'onUpdate:isPaused'?: (value: boolean) => void
	default?: string
	item?: string
	separator?: string
}
