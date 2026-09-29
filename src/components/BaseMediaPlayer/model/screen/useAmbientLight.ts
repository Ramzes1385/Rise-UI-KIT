import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MediaAmbientOptions } from '../../types/playback/MediaScreen.types'

const STORAGE_KEY = 'rise-media:ambient'

const SAMPLE_INTERVAL = 500

const WIDTH = 8

const HEIGHT = 4

const HAVE_CURRENT_DATA = 2

const FALLBACK_GLOW = '0 0 64px 8px rgb(59 130 246 / 35%)'

function readAmbient(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === '1'
	} catch {
		return false
	}
}

function writeAmbient(isOn: boolean): void {
	try {
		localStorage.setItem(STORAGE_KEY, isOn ? '1' : '0')
	} catch {
		return
	}
}

function averageColor(data: Uint8ClampedArray, pixels: number[]): string {
	const sum = [0, 0, 0]
	for (const pixel of pixels) for (let channel = 0; channel < 3; channel++) sum[channel] += data[pixel * 4 + channel]
	const [red, green, blue] = sum.map(value => Math.round(value / pixels.length))
	return `rgb(${red} ${green} ${blue} / 75%)`
}

function edgeGlow(data: Uint8ClampedArray): string {
	const column = (x: number): number[] => Array.from({ length: HEIGHT }, (_, y) => y * WIDTH + x)
	const row = (y: number): number[] => Array.from({ length: WIDTH }, (_, x) => y * WIDTH + x)
	const [left, right, top, bottom] = [column(0), column(WIDTH - 1), row(0), row(HEIGHT - 1)].map(pixels => averageColor(data, pixels))
	return `-48px 0 96px -12px ${left}, 48px 0 96px -12px ${right}, 0 -32px 96px -12px ${top}, 0 32px 96px -12px ${bottom}`
}

function useFrameSampler(options: MediaAmbientOptions) {
	const glow = ref(FALLBACK_GLOW)
	let context: CanvasRenderingContext2D | null | undefined
	const sample = (): void => {
		const media = options.media.value as HTMLVideoElement | null
		context ??= Object.assign(document.createElement('canvas'), { width: WIDTH, height: HEIGHT }).getContext('2d', {
			willReadFrequently: true,
		})
		if (!media || !context || media.readyState < HAVE_CURRENT_DATA) return
		try {
			context.drawImage(media, 0, 0, WIDTH, HEIGHT)
			glow.value = edgeGlow(context.getImageData(0, 0, WIDTH, HEIGHT).data)
		} catch {
			glow.value = FALLBACK_GLOW
		}
	}
	return { glow, sample }
}

export function useAmbientLight(options: MediaAmbientOptions) {
	const isAmbient = ref(typeof window === 'undefined' ? false : readAmbient())
	const { glow, sample } = useFrameSampler(options)
	let timer: ReturnType<typeof setInterval> | undefined
	watch(
		() => [isAmbient.value, options.state.isPaused, options.state.isSeeking] as const,
		([isOn, isPaused]) => {
			clearInterval(timer)
			if (!isOn) return
			sample()
			if (!isPaused) timer = setInterval(sample, SAMPLE_INTERVAL)
		},
		{ immediate: true },
	)
	onBeforeUnmount(() => clearInterval(timer))

	return {
		isAmbient,
		ambientStyle: computed(() => (isAmbient.value ? { '--media-ambient': glow.value } : {})),
		setAmbient(isOn: boolean): void {
			isAmbient.value = isOn
			writeAmbient(isOn)
		},
	}
}
