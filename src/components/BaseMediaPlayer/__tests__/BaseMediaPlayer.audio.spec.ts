import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import MediaSettingsMenu from '../ui/MediaSettingsMenu.vue'

const AUDIO_TRACKS = [{ label: 'Оригинал' }, { src: '/audio/anilibria.m4a', label: 'AniLibria', isDefault: true }]

async function setup(props: Record<string, unknown> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, {
		props: { sources: '/media/demo.webm', title: 'Серия 1', audioTracks: AUDIO_TRACKS, ...props },
		attachTo: document.body,
	})
	const videoElement = wrapper.get('video').element as HTMLVideoElement
	const audioElement = wrapper.get('audio').element as HTMLAudioElement
	const video = fakeMedia(videoElement, { duration: 60, volume: 0.6 })
	const audio = fakeMedia(audioElement)
	await nextTick()
	video.emit('loadedmetadata')
	await nextTick()
	return { wrapper, videoElement, audioElement, video, audio, settings: wrapper.findComponent(MediaSettingsMenu) }
}

describe('BaseMediaPlayer: озвучки', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('озвучка по умолчанию звучит вместо видео; меню получает варианты; выбор «Оригинал» возвращает звук видео', async () => {
		const { wrapper, videoElement, audioElement, settings } = await setup()

		expect(audioElement.getAttribute('src')).toBe('/audio/anilibria.m4a')
		expect(videoElement.muted).toBe(true)
		expect(audioElement.volume).toBe(0.6)
		expect(settings.props()).toMatchObject({
			audioOptions: [
				{ id: null, label: 'Оригинал' },
				{ id: '/audio/anilibria.m4a', label: 'AniLibria' },
			],
			activeAudioId: '/audio/anilibria.m4a',
		})
		settings.vm.$emit('select-audio', null)
		await nextTick()
		expect(videoElement.muted).toBe(false)
		expect(audioElement.hasAttribute('src')).toBe(false)
		expect(wrapper.emitted('update:audioTrack')).toEqual([['/audio/anilibria.m4a'], [null]])
		wrapper.unmount()
	})

	it('кнопка звука и громкость управляют озвучкой, а не видео', async () => {
		const { wrapper, videoElement, audioElement } = await setup()

		await wrapper.get('button[aria-label="Выключить звук"]').trigger('click')
		expect(audioElement.muted).toBe(true)
		expect(videoElement.muted).toBe(true)
		expect(wrapper.find('button[aria-label="Включить звук"]').exists()).toBe(true)
		expect(wrapper.emitted('update:isMuted')?.at(-1)).toEqual([true])
		wrapper.unmount()
	})

	it('v-model:audio-track: null с начала — звук видео; без списка озвучек аудио не загружается', async () => {
		const original = await setup({ audioTrack: null })
		expect(original.audioElement.hasAttribute('src')).toBe(false)
		expect(original.videoElement.muted).toBe(false)
		original.wrapper.unmount()

		const plain = await setup({ audioTracks: undefined })
		expect(plain.settings.props('audioOptions')).toEqual([])
		expect(plain.audioElement.hasAttribute('src')).toBe(false)
		plain.wrapper.unmount()
	})
})
