/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly STORYBOOK_YANDEX_MAPS_API_KEY?: string
}

declare module '*.scss'
declare module '*.css'

declare module '*.svg' {
	const src: string
	export default src
}

declare module '*.png' {
	const src: string
	export default src
}

declare module '*.jpg' {
	const src: string
	export default src
}

declare module '*.jpeg' {
	const src: string
	export default src
}

declare module '*.webp' {
	const src: string
	export default src
}

declare module '*.avif' {
	const src: string
	export default src
}

declare module '*.gif' {
	const src: string
	export default src
}
