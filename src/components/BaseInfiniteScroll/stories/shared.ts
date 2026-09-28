export const PAGE = 10

export function items(canvasElement: HTMLElement): number {
	return canvasElement.querySelectorAll('li').length
}
