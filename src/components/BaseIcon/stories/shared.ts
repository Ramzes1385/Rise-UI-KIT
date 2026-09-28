export const ICON_NAMES = Object.keys(import.meta.glob('../../../icons/svg/*.svg'))
	.map(path => path.slice(path.lastIndexOf('/') + 1, -'.svg'.length))
	.sort()
