import { nextTick } from 'vue'
import { afterEach, vi } from 'vitest'
import BasePresentationPlayer from '../../ui/BasePresentationPlayer.vue'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import type { BasePresentationPlayerProps, PresentationSlide } from '../../types/BasePresentationPlayer.types'

enableAutoUnmount(afterEach)

export function contentSlides(count: number, extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `s${index + 1}`,
		title: `Слайд-${index + 1}`,
		image: `/s${index + 1}.png`,
		duration: 10,
		...extra,
	}))
}

export async function mountContent(props: Partial<BasePresentationPlayerProps> & { slides: PresentationSlide[] }, options = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
	vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue(undefined)
	vi.spyOn(HTMLMediaElement.prototype, 'load').mockReturnValue(undefined)
	const wrapper = mount(BasePresentationPlayer, { attachTo: document.body, props: { title: 'Курс', ...props }, ...options })
	await nextTick()
	return wrapper
}

export type ContentWrapper = Awaited<ReturnType<typeof mountContent>>

export async function advance(ms: number): Promise<void> {
	await vi.advanceTimersByTimeAsync(ms)
	await flushPromises()
	await nextTick()
}

export const press = (wrapper: ContentWrapper, code: string) => wrapper.get('[role="region"]').trigger('keydown', { code })

export const captionText = (wrapper: ContentWrapper): string =>
	wrapper
		.findAll('.base-media-player__caption-line')
		.map(line => line.text())
		.join(' / ')

export const statusText = (wrapper: ContentWrapper): string => wrapper.findAll('[role="status"]').at(-1)?.text() ?? ''

export function stubCaptionsFetch(files: Record<string, string>) {
	const fetchMock = vi.fn(async (url: string) => (url in files ? new Response(files[url]) : new Response('not found', { status: 404 })))
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

interface FakeUtterance {
	text: string
	lang: string
	voice: SpeechSynthesisVoice | null
	rate: number
	volume: number
	onend: (() => void) | null
}

export function stubSpeech(initialVoices: Array<Pick<SpeechSynthesisVoice, 'name' | 'voiceURI' | 'lang'>> = []) {
	let voices = initialVoices as SpeechSynthesisVoice[]
	const listeners = new Set<() => void>()
	const spoken: FakeUtterance[] = []
	const engine = {
		getVoices: vi.fn(() => voices),
		speak: vi.fn((utterance: FakeUtterance) => spoken.push(utterance)),
		cancel: vi.fn(),
		pause: vi.fn(),
		resume: vi.fn(),
		addEventListener: vi.fn((_: string, listener: () => void) => listeners.add(listener)),
		removeEventListener: vi.fn((_: string, listener: () => void) => listeners.delete(listener)),
	}
	class Utterance implements FakeUtterance {
		lang = ''
		voice: SpeechSynthesisVoice | null = null
		rate = 1
		volume = 1
		onend: (() => void) | null = null
		text: string
		constructor(text: string) {
			this.text = text
		}
	}
	Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: engine })
	vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
	return {
		engine,
		spoken,
		last: (): FakeUtterance | undefined => spoken.at(-1),
		setVoices(next: Array<Pick<SpeechSynthesisVoice, 'name' | 'voiceURI' | 'lang'>>): void {
			voices = next as SpeechSynthesisVoice[]
			listeners.forEach(listener => listener())
		},
	}
}

export function removeSpeech(): void {
	Reflect.deleteProperty(window, 'speechSynthesis')
}
