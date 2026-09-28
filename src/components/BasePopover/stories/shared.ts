export const SHOWCASE_OWN_ARGS = ['isOpen', 'onUpdate:isOpen'] as const

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
