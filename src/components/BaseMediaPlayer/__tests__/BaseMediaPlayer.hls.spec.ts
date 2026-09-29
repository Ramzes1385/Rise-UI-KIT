import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { FakeHls } from './hls.test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import MediaSettingsMenu from '../ui/MediaSettingsMenu.vue'
import type { MediaHlsConstructor } from '../types/MediaHls.types'

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
	return { wrapper, videoElement, fake, settings: wrapper.findComponent(MediaSettingsMenu) }
}

describe('BaseMediaPlayer: HLS', () => {
	beforeEach(() => {
		FakeHls.reset()
	})

	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('поток .m3u8 играет через hls.js: адрес элементу не назначается, качество и озвучки — из потока', async () => {
		const { wrapper, videoElement, settings } = await setup({ hlsConfig: { lowLatencyMode: false } })
		const hls = FakeHls.last()

		expect(videoElement.hasAttribute('src')).toBe(false)
		expect(hls.config).toEqual({ lowLatencyMode: false })
		expect(hls.attachMedia).toHaveBeenCalledWith(videoElement)
		expect(settings.props('qualities').map((option: { label: string }) => option.label)).toEqual([
			'Авто (360p)',
			'1080p',
			'360p',
			expect.stringContaining('кбит/с'),
		])
		expect(settings.props('activeQualityId')).toBe('auto')
		expect(settings.props('audioOptions')).toHaveLength(3)
		settings.vm.$emit('select-quality', 'hls:1')
		settings.vm.$emit('select-audio', 'hls-audio:1')
		await nextTick()
		expect([hls.manualLevel, hls.audioTrack]).toEqual([1, 1])
		expect(settings.props('activeQualityId')).toBe('hls:1')
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
