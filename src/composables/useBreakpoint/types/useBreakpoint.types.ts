import type { Ref } from 'vue'

/**
 * Брейкпоинты библиотеки в пикселях.
 * Дублируют SCSS-карту $breakpoints (src/styles/_variables.scss) — держать синхронно.
 */
export const BREAKPOINTS = {
	xs: 320,
	sm: 480,
	mobile: 640,
	md: 768,
	lg: 1024,
	xl: 1440,
	xxl: 1920,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * Результат composable useBreakpoint
 */
export interface UseBreakpointReturn {
	/** Реактивная ширина окна в пикселях */
	width: Readonly<Ref<number>>
	/** Наибольший активный брейкпоинт для текущей ширины */
	current: Readonly<Ref<BreakpointName>>
	/** true, если ширина меньше брейкпоинта md (мобильный режим) */
	isMobile: Readonly<Ref<boolean>>
	/** Проверяет, что ширина >= указанного брейкпоинта */
	isGreaterOrEqual: (name: BreakpointName) => boolean
	/** Проверяет, что ширина < указанного брейкпоинта */
	isSmallerThan: (name: BreakpointName) => boolean
}
