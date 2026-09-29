import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import MediaSlider from '../ui/MediaSlider.vue'
import { flushPromises, mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import { fakeRemote, installCastSdk, removeCastSdk } from './cast.test-utils'

const PLAYLISTS = [
	{
		id: 's1',
		title: 'Сезон 1',
		episodes: [
			{ id: 'e1', title: 'Серия 1', sources: '/e1.webm', poster: '/e1.webp' },
			{ id: 'e2', title: 'Серия 2', sources: '/e2.mp4' },
		],
	},
]

async function setup(options: { props?: Record<string, unknown>; remote?: boolean } = {}) {
	const wrapper = mount(BaseMediaPlayer, {
		props: { sources: '/media/demo.webm', title: 'Демо', ...options.props },
		attachTo: document.body,
	})
	const video = wrapper.get('video').element as HTMLVideoElement
	const fake = fakeMedia(video, { duration: 60 })
	const remote = options.remote ? fakeRemote(video) : null
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	const castButton = () => wrapper.find('.base-media-player__controls button[aria-pressed]')
	return { wrapper, video, fake, remote, castButton }
}

describe('BaseMediaPlayer: трансляция на телевизор', () => {
	afterEach(() => {
		removeCastSdk()
		document.body.innerHTML = ''
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('без устройств и без Cast кнопки трансляции нет', async () => {
		const { wrapper, castButton } = await setup()
		expect(castButton().exists()).toBe(false)
		expect(wrapper.find('.base-media-player__cast').exists()).toBe(false)
		wrapper.unmount()
	})

	it('Remote Playback: выбор устройства браузером; во время трансляции — сообщение, управление остаётся', async () => {
		const { wrapper, remote, castButton } = await setup({ remote: true })
		await vi.waitFor(() => expect(castButton().exists()).toBe(true))
		expect(castButton().attributes()).toMatchObject({ 'aria-label': 'Трансляция на телевизор', 'aria-pressed': 'false' })

		await castButton().trigger('click')
		expect(remote?.remote.prompt).toHaveBeenCalledOnce()
		remote?.setState('connected')
		await nextTick()
		expect(castButton().attributes()).toMatchObject({ 'aria-label': 'Остановить трансляцию', 'aria-pressed': 'true' })
		expect(wrapper.get('.base-media-player__cast-message').text()).toBe('Воспроизводится на телевизоре')
		expect(wrapper.classes()).toContain('base-media-player--casting')
		expect(wrapper.classes()).not.toContain('base-media-player--cast-remote')
		expect(wrapper.find('.base-media-player__cast-controls').exists()).toBe(false)
		await castButton().trigger('click')
		expect(remote?.remote.prompt).toHaveBeenCalledTimes(2)
		wrapper.unmount()
	})

	it('устройство не ответило — сообщение «Не удалось начать трансляцию»; закрытый выбор устройства — без сообщения', async () => {
		const { wrapper, remote, castButton } = await setup({ remote: true })
		await vi.waitFor(() => expect(castButton().exists()).toBe(true))
		const prompt = remote?.remote.prompt as ReturnType<typeof vi.fn>
		const flash = (): string => wrapper.get('.base-media-player__flash').text()

		prompt.mockRejectedValueOnce(new DOMException('dismissed', 'NotAllowedError'))
		await castButton().trigger('click')
		await flushPromises()
		expect(flash()).toBe('')

		prompt.mockRejectedValueOnce(new DOMException('gone', 'NotFoundError'))
		await castButton().trigger('click')
		await vi.waitFor(() => expect(flash()).toBe('Не удалось начать трансляцию'))
		wrapper.unmount()
	})

	it('Cast: запись уходит на телевизор с текущей секунды, плеер показывает пульт; остановка — продолжение здесь', async () => {
		const cast = installCastSdk()
		const { wrapper, fake, castButton } = await setup({ props: { castReceiverId: 'RISE0001' } })
		fake.update({ currentTime: 12 }, 'seeked')
		await castButton().trigger('click')
		await vi.waitFor(() => expect(cast.session.loadMedia).toHaveBeenCalledOnce())
		expect(cast.context.setOptions).toHaveBeenCalledWith(expect.objectContaining({ receiverApplicationId: 'RISE0001' }))
		expect(cast.session.loadMedia.mock.calls[0][0]).toMatchObject({
			currentTime: 12,
			media: { contentId: 'http://localhost:3000/media/demo.webm', contentType: 'video/webm', metadata: { title: 'Демо' } },
		})
		expect(fake.pause).toHaveBeenCalled()

		cast.updateRemote({ isConnected: true, isPaused: false, currentTime: 14, duration: 60 })
		await nextTick()
		expect(wrapper.classes()).toContain('base-media-player--cast-remote')
		expect(wrapper.get('.base-media-player__cast-message').text()).toBe('Воспроизводится на «Гостиная»')
		const controls = wrapper.get('.base-media-player__cast-controls')
		expect(controls.get('.base-media-player__time').text()).toBe('0:14 / 1:00')
		await controls.get('button[aria-label="Пауза"]').trigger('click')
		expect(cast.controller.playOrPause).toHaveBeenCalledOnce()
		const slider = wrapper.findAllComponents(MediaSlider).find(item => item.element.closest('.base-media-player__cast-controls'))
		slider?.vm.$emit('update:modelValue', 30)
		expect(cast.players[0].currentTime).toBe(30)
		cast.updateRemote({})

		const stop = controls.findAll('button').find(button => button.text() === 'Остановить трансляцию')
		await stop?.trigger('click')
		expect(cast.context.endCurrentSession).toHaveBeenCalledWith(true)
		await castButton().trigger('click')
		expect(cast.context.endCurrentSession).toHaveBeenCalledTimes(2)
		cast.updateRemote({ isConnected: false, currentTime: 0 })
		await nextTick()
		expect(fake.values.currentTime).toBe(30)
		expect(fake.play).toHaveBeenCalled()
		expect(wrapper.find('.base-media-player__cast').exists()).toBe(false)
		wrapper.unmount()
	})

	it('Cast: клавиши управляют телевизором, новая серия уходит на телевизор с начала, здесь не играет', async () => {
		const cast = installCastSdk()
		const { wrapper, fake, castButton } = await setup({ props: { sources: undefined, playlists: PLAYLISTS } })
		await castButton().trigger('click')
		await vi.waitFor(() => expect(cast.session.loadMedia).toHaveBeenCalledOnce())
		expect(cast.session.loadMedia.mock.calls[0][0]).toMatchObject({
			media: { metadata: { title: 'Демо. Серия 1', images: [{ url: 'http://localhost:3000/e1.webp' }] } },
		})
		cast.updateRemote({ isConnected: true, isPaused: true, currentTime: 20, duration: 40 })
		await nextTick()
		fake.play.mockClear()

		await wrapper.trigger('keydown', { code: 'Space' })
		expect(cast.controller.playOrPause).toHaveBeenCalledOnce()
		await wrapper.trigger('keydown', { code: 'ArrowRight' })
		expect(cast.players[0].currentTime).toBe(25)
		await wrapper.trigger('keydown', { code: 'Digit5' })
		expect(cast.players[0].currentTime).toBe(20)
		await wrapper.trigger('keydown', { code: 'End' })
		await wrapper.trigger('keydown', { code: 'KeyN', shiftKey: true })
		await vi.waitFor(() => expect(cast.session.loadMedia).toHaveBeenCalledTimes(2))
		expect(cast.session.loadMedia.mock.calls[1][0]).toMatchObject({
			currentTime: 0,
			media: { contentId: 'http://localhost:3000/e2.mp4', contentType: 'video/mp4', metadata: { title: 'Демо. Серия 2' } },
		})
		await nextTick()
		expect(fake.play).not.toHaveBeenCalled()
		wrapper.unmount()
	})
})
