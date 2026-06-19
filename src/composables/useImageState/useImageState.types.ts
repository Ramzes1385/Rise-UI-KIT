export interface UseImageStateOptions {
	src: () => string
	fallbackSrc?: () => string
	timeout: () => number
	width?: () => number | string
	height?: () => number | string
	aspectRatio?: () => string
	borderRadius: () => number
	srcWidth?: () => number
	convertToWebp: () => boolean
	onLoad?: () => void
	onError?: () => void
}
