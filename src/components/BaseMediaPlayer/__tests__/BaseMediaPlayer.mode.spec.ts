import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { isAudioSource } from '../model/useMediaSources'
import { fakeMedia } from './BaseMediaPlayer.test-utils'

async function setup(props: Record<string, unknown>) {
	vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
	const wrapper = mount(BaseMediaPlayer, {
		props: { title: 'Подкаст', tracks: [{ src: '/subs.vtt', label: 'Русский' }], ...props },
		attachTo: document.body,
	})
	const fake = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	const labels = (): string[] =>
		wrapper.findAll('.base-media-player__controls button').map(button => button.attributes('aria-label') ?? '')
	return { wrapper, fake, labels }
}

describe('BaseMediaPlayer: аудиорежим', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it.each([
		[{ src: '/a.mp3' }, true],
		[{ src: '/a.M4A?token=1' }, true],
		[{ src: '/a.webm', type: 'audio/webm' }, true],
		[{ src: '/a.webm', type: 'video/webm' }, false],
		[{ src: '/a.mp4' }, false],
		[null, false],
	])('аудиоисточник %o → %s', (item, expected) => {
		expect(isAudioSource(item)).toBe(expected)
	})

	it('auto по аудиофайлу: без пропорций кадра, полного и широкого экрана и кнопки субтитров; панель не прячется', async () => {
		vi.useFakeTimers()
		const { wrapper, fake, labels } = await setup({ sources: '/episode-12.mp3', idleTimeout: 500 })
		expect(wrapper.classes()).toContain('base-media-player--audio')
		expect(wrapper.attributes('style') ?? '').not.toContain('aspect-ratio')
		expect(labels()).not.toEqual(expect.arrayContaining(['Широкий экран', 'Во весь экран', 'Субтитры']))
		await fake.play()
		vi.advanceTimersByTime(2000)
		await nextTick()
		expect(wrapper.classes()).not.toContain('base-media-player--idle')
		await wrapper.trigger('keydown', { code: 'KeyT' })
		await wrapper.trigger('keydown', { code: 'KeyF' })
		expect(wrapper.emitted('update:isTheater')).toBeUndefined()
		vi.useRealTimers()
		wrapper.unmount()
	})

	it('mode задаёт вид явно: video для аудиофайла и audio для видео', async () => {
		const video = await setup({ sources: '/episode-12.mp3', mode: 'video' })
		expect(video.wrapper.classes()).not.toContain('base-media-player--audio')
		expect(video.wrapper.attributes('style')).toContain('aspect-ratio: 16 / 9')
		await video.wrapper.trigger('keydown', { code: 'KeyT' })
		expect(video.wrapper.emitted('update:isTheater')).toEqual([[true]])
		video.wrapper.unmount()

		const audio = await setup({ sources: '/episode-12.mp4', mode: 'audio' })
		expect(audio.wrapper.classes()).toContain('base-media-player--audio')
		audio.wrapper.unmount()
	})
})
