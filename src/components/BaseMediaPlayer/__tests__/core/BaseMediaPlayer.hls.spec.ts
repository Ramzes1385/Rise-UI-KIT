import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { fireEvent } from '@testing-library/vue'
import { FakeHls } from '../utils/hls.test-utils'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fakeMedia, playerMenu } from '../utils/BaseMediaPlayer.test-utils'
import type { MediaHlsConstructor } from '../../types/playback/MediaHls.types'

const Hls = FakeHls as unknown as MediaHlsConstructor

async function setup(props: Record<string, unknown> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, {
		props: { sources: [{ src: '/stream/master.m3u8', type: 'application/x-mpegURL' }], title: 'Поток', hls: Hls, ...props },
		attachTo: document.body,
	})
	const videoElement = wrapper.get('video').element as HTMLVideoElement
	const fake = fakeMedia(videoElement, { duration: 60, currentTime: 20 })
	await nextTick()
	return { wrapper, videoElement, fake, quality: playerMenu(wrapper, 'Качество'), dub: playerMenu(wrapper, 'Озвучка') }
}

describe('BaseMediaPlayer: HLS', () => {
	beforeEach(() => {
		FakeHls.reset()
	})

	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('превью кадра над шкалой берёт кадры из потока своим hls.js на самом низком качестве', async () => {
		const { wrapper, fake } = await setup({ hlsConfig: { lowLatencyMode: false } })
		fake.emit('loadedmetadata')
		await nextTick()
		const slider = wrapper.get('.base-media-player__seek').element as HTMLElement
		slider.getBoundingClientRect = () => ({ left: 0, width: 600 }) as DOMRect

		await fireEvent.pointerMove(slider, { clientX: 300 })
		expect(FakeHls.instances).toHaveLength(2)
		expect(FakeHls.last().config).toEqual({ lowLatencyMode: false, startLevel: 0, maxBufferLength: 2, backBufferLength: 0 })
		expect(FakeHls.last().loadSource).toHaveBeenCalledWith('/stream/master.m3u8')
		wrapper.unmount()
	})

	it('поток .m3u8 играет через hls.js: адрес элементу не назначается, качество и озвучки — из потока', async () => {
		const { wrapper, videoElement, quality, dub } = await setup({ hlsConfig: { lowLatencyMode: false } })
		const hls = FakeHls.last()

		expect(videoElement.hasAttribute('src')).toBe(false)
		expect(hls.config).toEqual({ lowLatencyMode: false })
		expect(hls.attachMedia).toHaveBeenCalledWith(videoElement)
		expect(quality.options()).toEqual(['Авто (360p)', '1080p', '360p', expect.stringContaining('кбит/с')])
		expect(quality.checked()).toBe('Авто (360p)')
		expect(dub.options()).toHaveLength(3)
		quality.pick('1080p')
		dub.pickAt(1)
		await nextTick()
		expect([hls.manualLevel, hls.audioTrack]).toEqual([1, 1])
		expect(quality.checked()).toBe('1080p')
		expect(wrapper.emitted('update:audioTrack')).toEqual([['hls-audio:1']])
		wrapper.unmount()
	})

	it('неустранимая ошибка потока — сообщение и «Повторить», которое создаёт hls.js заново', async () => {
		const { wrapper } = await setup()
		FakeHls.last().emit('hlsError', { fatal: true, type: 'otherError' })
		await nextTick()

		expect(wrapper.get('[role="alert"]').text()).toContain('Не удалось декодировать запись')
		expect(wrapper.emitted('error')?.[0]).toEqual([expect.objectContaining({ code: 'decode' })])
		await wrapper.get('[role="alert"] button').trigger('click')
		expect(FakeHls.instances).toHaveLength(2)
		expect(wrapper.find('[role="alert"]').exists()).toBe(false)
		wrapper.unmount()
	})

	it('без поддержки hls.js поток .m3u8 неиграбелен; обычный файл повторяется средствами элемента', async () => {
		FakeHls.isSupported.mockReturnValue(false)
		const unsupported = await setup()
		expect(unsupported.wrapper.get('[role="alert"]').text()).toContain('Запись недоступна')
		unsupported.wrapper.unmount()

		const file = await setup({ sources: '/media/demo.webm' })
		file.fake.update({ error: { code: 2 } }, 'error')
		await nextTick()
		await file.wrapper.get('[role="alert"] button').trigger('click')
		expect(file.fake.load).toHaveBeenCalledOnce()
		expect(FakeHls.instances).toHaveLength(0)
		file.wrapper.unmount()
	})
})
