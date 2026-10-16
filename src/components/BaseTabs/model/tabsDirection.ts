export function isRtl(element: Element | null): boolean {
	return element !== null && getComputedStyle(element).direction === 'rtl'
}
