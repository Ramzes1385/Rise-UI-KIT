export interface UseImageStateOptions {
	src: () => string
	fallbackSrc?: () => string | undefined
	timeout: () => number
	width?: () => number | string | undefined
	height?: () => number | string | undefined
	aspectRatio?: () => string | undefined
	borderRadius: () => number | undefined
	srcWidth?: () => number | undefined
	convertToWebp: () => boolean
	onLoad?: () => void
	onError?: () => void
}
