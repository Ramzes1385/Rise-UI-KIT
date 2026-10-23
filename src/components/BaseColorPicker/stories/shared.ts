export const CENTERED = 'display: flex; justify-content: center;'

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
