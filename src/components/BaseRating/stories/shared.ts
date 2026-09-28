export function starOf(rating: HTMLElement, index: number): HTMLElement {
	return rating.querySelectorAll<HTMLElement>('.base-rating__star').item(index)
}

export function fillOf(star: HTMLElement): string {
	return (star.querySelector('.base-rating__star-fill') as HTMLElement).style.width
}

export function pointOn(star: HTMLElement, ratio = 0.5): { x: number; y: number } {
	const rect = star.getBoundingClientRect()
	return { x: rect.left + rect.width * ratio, y: rect.top + rect.height / 2 }
}
