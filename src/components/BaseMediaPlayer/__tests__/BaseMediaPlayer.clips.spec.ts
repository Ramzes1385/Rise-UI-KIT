import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref, shallowRef } from 'vue'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import MediaSeekPreview from '../ui/MediaSeekPreview.vue'
import { PLAYER_CONTEXT_KEY } from '../model/usePlayerContext'
import type { MediaPlaylist } from '../types/MediaPlaylist.types'
import type { MediaThumbnailCue } from '../types/MediaPreview.types'

const INTRO = { sources: '/clips/intro.webm' }

const OUTRO = { sources: '/clips/outro.webm' }

async function setup(props: Record<string, unknown> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
	const wrapper = mount(BaseMediaPlayer, { props: { title: 'Демо', sources: '/media/demo.webm', ...props }, attachTo: document.body })
	const video = wrapper.get('video').element as HTMLVideoElement
	const fake = fakeMedia(video, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { wrapper, video, fake }
}

describe('BaseMediaPlayer: интро и аутро', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('интро поверх кадра: подпись, пауза, «Пропустить интро»; панель скрыта, клавиши выключены', async () => {
		const { wrapper, fake } = await setup({ intro: INTRO })

		fake.emit('play')
		await nextTick()
		const overlay = wrapper.get('.base-media-player__ad--clip')
		expect(wrapper.classes()).toContain('base-media-player--clip')
		expect(overlay.attributes('aria-label')).toBe('Интро')
		expect(overlay.get('video').attributes('src')).toBe('/clips/intro.webm')
		await wrapper.trigger('keydown', { key: 'ArrowRight', code: 'ArrowRight' })
		expect(fake.values.currentTime).toBe(0)
		const clip = overlay.get('video')
		Object.defineProperty(clip.element, 'duration', { configurable: true, value: 3 })
		await clip.trigger('loadedmetadata')
		Object.defineProperty(clip.element, 'paused', { configurable: true, value: false })
		await clip.trigger('play')
		expect(overlay.find('button[aria-label="Пауза"]').exists()).toBe(true)
		Object.defineProperty(clip.element, 'paused', { configurable: true, value: true })
		;(clip.element as HTMLVideoElement).currentTime = 1.5
		await clip.trigger('timeupdate')
		expect(overlay.get('.base-media-player__ad-progress').attributes('style')).toContain('width: 50%')
		await clip.trigger('pause')
		expect(overlay.find('button[aria-label="Воспроизвести"]').exists()).toBe(true)
		await clip.trigger('click')
		await overlay.get('.base-media-player__skip').trigger('click')
		expect(wrapper.find('.base-media-player__ad--clip').exists()).toBe(false)
		expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
		wrapper.unmount()
	})

	it('аутро после конца; ошибка ролика и его конец возвращают к серии; у серии свои ролики, null отключает', async () => {
		const playlists: MediaPlaylist[] = [
			{
				id: 's1',
				title: 'Сезон 1',
				intro: INTRO,
				outro: OUTRO,
				episodes: [
					{ id: 'e1', title: 'Серия 1', sources: '/e1.webm', outro: { sources: '/clips/own.webm', skipAfter: 5 } },
					{ id: 'e2', title: 'Серия 2', sources: '/e2.webm', intro: null },
				],
			},
		]
		const { wrapper, fake } = await setup({ playlists, outro: OUTRO })

		fake.emit('play')
		await nextTick()
		await wrapper.get('.base-media-player__ad--clip video').trigger('error')
		expect(wrapper.find('.base-media-player__ad--clip').exists()).toBe(false)
		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()
		expect(wrapper.find('.base-media-player__next').exists()).toBe(false)
		const outro = wrapper.get('.base-media-player__ad--clip')
		expect(outro.attributes('aria-label')).toBe('Аутро')
		expect(outro.get('video').attributes('src')).toBe('/clips/own.webm')
		expect(outro.get('.base-media-player__ad-wait').text()).toBe('Пропустить через 5')
		await outro.get('video').trigger('ended')
		expect(wrapper.find('.base-media-player__next').exists()).toBe(true)
		wrapper.unmount()

		const second = await setup({ playlists, episode: 'e2' })
		second.fake.emit('play')
		await nextTick()
		expect(second.wrapper.find('.base-media-player__ad--clip').exists()).toBe(false)
		second.wrapper.unmount()
	})
})

describe('превью над шкалой', () => {
	function preview(context: Record<string, unknown>, time = 5) {
		return mount(MediaSeekPreview, {
			props: { time },
			global: {
				provide: {
					[PLAYER_CONTEXT_KEY as symbol]: {
						previewThumbnail: () => null,
						previewFrame: shallowRef(null),
						requestPreviewFrame: vi.fn(),
						hasPreviewFrames: ref(false),
						chapterTitleAt: () => '',
						state: { duration: 60 },
						...context,
					},
				},
			},
		})
	}

	it('миниатюра из спрайта масштабируется до 160px, целая картинка — на весь кадр', () => {
		const sprite: MediaThumbnailCue = { start: 0, end: 10, url: '/s".jpg', area: { x: 320, y: 90, width: 320, height: 180 } }
		const part = preview({ previewThumbnail: () => sprite, chapterTitleAt: () => 'Опенинг' })

		expect(part.get('.base-media-player__preview-frame').attributes('style')).toBe('width: 160px; height: 90px;')
		const style = part.get('.base-media-player__preview-sprite').attributes('style')
		expect(style).toContain('url("/s%22.jpg")')
		expect(style).toContain('background-position: -320px -90px')
		expect(style).toContain('scale(0.5)')
		expect(part.get('.base-media-player__preview-chapter').text()).toBe('Опенинг')
		expect(part.get('.base-media-player__preview-time').text()).toBe('0:05')

		const whole = preview({ previewThumbnail: () => ({ start: 0, end: 10, url: '/full.jpg' }) })
		expect(whole.get('.base-media-player__preview-sprite').attributes('style')).toContain('background-size: cover')
	})

	it('кадр из записи: запрос при смене времени, рисуется, когда готов; до этого — заглушка', async () => {
		const drawImage = vi.fn()
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
		const frame = shallowRef<HTMLCanvasElement | null>(null)
		const requestPreviewFrame = vi.fn()
		const view = preview({ hasPreviewFrames: ref(true), previewFrame: frame, requestPreviewFrame })

		expect(requestPreviewFrame).toHaveBeenCalledWith(5)
		expect(view.get('canvas').classes()).toContain('base-media-player__preview-frame--loading')
		await view.setProps({ time: 7 })
		expect(requestPreviewFrame).toHaveBeenLastCalledWith(7)
		const ready = document.createElement('canvas')
		ready.width = 320
		ready.height = 180
		frame.value = ready
		await nextTick()
		expect(drawImage).toHaveBeenCalledWith(ready, 0, 0)
		expect((view.get('canvas').element as HTMLCanvasElement).width).toBe(320)
		expect(view.get('canvas').classes()).not.toContain('base-media-player__preview-frame--loading')
		expect(preview({}).find('canvas').exists()).toBe(false)
		vi.restoreAllMocks()
	})
})
