import { isRtl } from '@utils/dom/directionUtils'

export function starOf(rating: HTMLElement, index: number): HTMLElement {
	return rating.querySelectorAll<HTMLElement>('.base-rating__star').item(index)
}

export function fillOf(star: HTMLElement): string {
	return (star.querySelector('.base-rating__star-fill') as HTMLElement).style.getPropertyValue('--rating-fill-size')
}

export function pointOn(star: HTMLElement, ratio = 0.5): { x: number; y: number } {
	const rect = star.getBoundingClientRect()
	const x = isRtl(document.documentElement) ? rect.right - rect.width * ratio : rect.left + rect.width * ratio
	return { x, y: rect.top + rect.height / 2 }
}
