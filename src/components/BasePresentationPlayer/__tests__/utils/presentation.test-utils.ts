import { nextTick } from 'vue'
import { afterEach, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import BasePresentationPlayer from '../../ui/BasePresentationPlayer.vue'
import { fakeMedia } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'
import type { PresentationSlide, BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

export function slidesOf(count: number, extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `s${index + 1}`,
		title: `Слайд-${index + 1}`,
		image: `/s${index + 1}.png`,
		...extra,
	}))
}

export function stubMediaPrototype(): void {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
	vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue(undefined)
	vi.spyOn(HTMLMediaElement.prototype, 'load').mockReturnValue(undefined)
}

export function setVisibility(state: 'visible' | 'hidden'): void {
	Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
	document.dispatchEvent(new Event('visibilitychange'))
}

enableAutoUnmount(afterEach)

export async function mountPresentation(props: Partial<BasePresentationPlayerProps> & { slides: PresentationSlide[] }, options = {}) {
	stubMediaPrototype()
	const wrapper = mount(BasePresentationPlayer, { attachTo: document.body, props: { title: 'Курс', ...props }, ...options })
	await nextTick()
	return wrapper
}

export type PresentationWrapper = Awaited<ReturnType<typeof mountPresentation>>

export function fakeAudio(wrapper: PresentationWrapper, initial: Parameters<typeof fakeMedia>[1] = {}) {
	const media = fakeMedia(wrapper.find('audio').element as HTMLAudioElement, initial)
	media.emit('loadedmetadata')
	return media
}

export const button = (wrapper: PresentationWrapper, name: string) => wrapper.get(`button[aria-label="${name}"]`)

export const statusText = (wrapper: PresentationWrapper): string => wrapper.findAll('[role="status"]').at(-1)?.text() ?? ''
