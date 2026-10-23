import { nextTick, reactive, ref } from 'vue'
import { useCastSdk } from '../../model/cast/useCastSdk'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useRemotePlayback } from '../../model/cast/useRemotePlayback'
import type { MediaState } from '../../types/playback/MediaCore.types'
import type { MediaCastContent } from '../../types/playback/MediaCast.types'
import { fakeRemote, installCastSdk, removeCastSdk } from '../utils/cast.test-utils'

describe('useRemotePlayback', () => {
	it('доступность устройства, подключение, выбор устройства; обработчики снимаются', async () => {
		const element = document.createElement('video')
		const { remote, setAvailable, setState } = fakeRemote(element)
		const { result, wrapper } = withSetup(() => useRemotePlayback(ref(element)))
		await vi.waitFor(() => expect(result.isRemoteAvailable.value).toBe(true))

		setAvailable(false)
		expect(result.isRemoteAvailable.value).toBe(false)
		setState('connecting')
		expect(result.remoteState.value).toBe('connecting')
		setState('connected')
		expect(result.isRemoteConnected.value).toBe(true)
		await expect(result.promptRemote()).resolves.toBe(true)
		expect(remote.prompt).toHaveBeenCalledOnce()
		;(remote.prompt as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new DOMException('no', 'NotAllowedError'))
		await expect(result.promptRemote()).resolves.toBe(true)
		;(remote.prompt as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new DOMException('gone', 'NotFoundError'))
		await expect(result.promptRemote()).resolves.toBe(false)
		;(remote.prompt as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('broken'))
		await expect(result.promptRemote()).resolves.toBe(false)
		;(remote.cancelWatchAvailability as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new DOMException('gone', 'NotFoundError'))
		wrapper.unmount()
		expect(remote.cancelWatchAvailability).toHaveBeenCalledWith(7)
	})

	it('без Remote Playback или без наблюдения за устройствами кнопки нет', async () => {
		const unsupported = document.createElement('video')
		fakeRemote(unsupported, { isSupported: false })
		const first = withSetup(() => useRemotePlayback(ref(unsupported)))
		await nextTick()
		expect(first.result.isRemoteAvailable.value).toBe(false)
		first.wrapper.unmount()

		const plain = withSetup(() => useRemotePlayback(ref(document.createElement('video'))))
		expect(plain.result.isRemoteAvailable.value).toBe(false)
		await expect(plain.result.promptRemote()).resolves.toBe(false)
	})
})

describe('useCastSdk', () => {
	function setup(content: Partial<MediaCastContent> = {}, receiverId?: string) {
		const state = reactive({ currentTime: 42 }) as MediaState
		const resumeLocal = vi.fn()
		const pauseLocal = vi.fn()
		const { result, wrapper } = withSetup(() =>
			useCastSdk({
				media: ref(document.createElement('video')),
				state,
				receiverId: () => receiverId,
				content: () => ({
					source: { src: '/video/ep1.mp4', type: 'video/mp4' },
					title: 'Серия 1',
					poster: '/ep1.webp',
					...content,
				}),
				resumeLocal,
				pauseLocal,
			}),
		)
		return { result, wrapper, resumeLocal, pauseLocal }
	}

	afterEach(() => {
		removeCastSdk()
	})

	it('телевизор не принял запись; перемотка в пределах записи; новая запись только во время трансляции', async () => {
		const cast = installCastSdk()
		const { result, pauseLocal } = setup()
		result.loadCast(0)
		expect(cast.session.loadMedia).not.toHaveBeenCalled()

		cast.session.loadMedia.mockRejectedValueOnce(new Error('LOAD_FAILED'))
		await result.startCast()
		expect(pauseLocal).toHaveBeenCalledOnce()
		cast.updateRemote({ isConnected: true, duration: 100 })
		result.castSeek(-5)
		expect(cast.players[0].currentTime).toBe(0)
		result.castSeek(500)
		expect(cast.players[0].currentTime).toBe(100)
		cast.updateRemote({ duration: 0 })
		result.castSeek(500)
		expect(cast.players[0].currentTime).toBe(500)
		result.loadCast(0)
		expect(cast.session.loadMedia).toHaveBeenLastCalledWith(expect.objectContaining({ currentTime: 0 }))
	})

	it('скрипт уже загружен: настройки приёмника, доступность по состоянию Cast', () => {
		const cast = installCastSdk('NO_DEVICES_AVAILABLE')
		const { result } = setup({}, 'ABCD1234')

		expect(cast.context.setOptions).toHaveBeenCalledWith({ receiverApplicationId: 'ABCD1234', autoJoinPolicy: 'origin_scoped' })
		expect(result.isCastAvailable.value).toBe(false)
		cast.setCastState('NOT_CONNECTED')
		expect(result.isCastAvailable.value).toBe(true)
	})

	it('трансляция: выбор устройства, загрузка записи с позиции, управление и возврат на это устройство', async () => {
		const cast = installCastSdk()
		const { result, pauseLocal, resumeLocal } = setup()

		await result.startCast()
		expect(cast.context.setOptions).toHaveBeenCalledWith({ receiverApplicationId: 'CC1AD845', autoJoinPolicy: 'origin_scoped' })
		expect(pauseLocal).toHaveBeenCalledOnce()
		const request = cast.session.loadMedia.mock.calls[0][0] as {
			currentTime: number
			autoplay: boolean
			media: Record<string, unknown>
		}
		expect(request).toMatchObject({ currentTime: 42, autoplay: true })
		expect(request.media).toMatchObject({ contentId: 'http://localhost:3000/video/ep1.mp4', contentType: 'video/mp4' })
		expect(request.media.metadata).toMatchObject({ title: 'Серия 1', images: [{ url: 'http://localhost:3000/ep1.webp' }] })

		cast.updateRemote({ isConnected: true, isPaused: false, currentTime: 50, duration: 1400 })
		expect(result.isCastConnected.value).toBe(true)
		expect(result.castDevice.value).toBe('Гостиная')
		expect(result.castRemote).toMatchObject({ isPaused: false, currentTime: 50, duration: 1400 })
		result.castPlayOrPause()
		result.castSeek(120)
		expect(cast.controller.playOrPause).toHaveBeenCalledOnce()
		expect(cast.controller.seek).toHaveBeenCalledOnce()
		expect(cast.players[0].currentTime).toBe(120)
		result.stopCast()
		expect(cast.context.endCurrentSession).toHaveBeenCalledWith(true)
		cast.updateRemote({ isConnected: false, currentTime: 0 })
		expect(resumeLocal).toHaveBeenCalledWith(50, true)
		cast.updateRemote({ isConnected: false })
		expect(resumeLocal).toHaveBeenCalledOnce()
	})

	it('тип записи по адресу, без обложки; отмена выбора устройства и запись без источника — ничего', async () => {
		const cast = installCastSdk()
		const hls = setup({ source: { src: '/stream/master.m3u8' }, poster: undefined })
		await hls.result.startCast()
		const request = cast.session.loadMedia.mock.calls[0][0] as { media: { contentType: string; metadata: { images?: unknown } } }
		expect(request.media.contentType).toBe('application/x-mpegURL')
		expect(request.media.metadata.images).toBeUndefined()

		for (const [src, type] of [
			['/a.webm', 'video/webm'],
			['/a.mpd', 'application/dash+xml'],
			['/a.mov', 'video/mp4'],
		]) {
			const other = setup({ source: { src } })
			await other.result.startCast()
			expect((cast.session.loadMedia.mock.calls.at(-1)?.[0] as { media: { contentType: string } }).media.contentType).toBe(type)
		}

		cast.context.requestSession.mockRejectedValueOnce('cancel')
		cast.state.session = null
		const canceled = setup()
		await expect(canceled.result.startCast()).resolves.toBe(true)
		expect(canceled.pauseLocal).not.toHaveBeenCalled()
		cast.context.requestSession.mockRejectedValueOnce('receiver_unavailable')
		await expect(setup().result.startCast()).resolves.toBe(false)
		const empty = setup({ source: null })
		await empty.result.startCast()
		expect(empty.pauseLocal).not.toHaveBeenCalled()
	})

	it('скрипт загрузился позже: плеер подключается по __onGCastApiAvailable и не мешает чужому обработчику', async () => {
		const previous = vi.fn()
		Object.assign(window, { __onGCastApiAvailable: previous })
		const { result } = setup()
		expect(result.isCastAvailable.value).toBe(false)
		result.castPlayOrPause()
		result.castSeek(10)
		result.stopCast()
		await result.startCast()

		installCastSdk()
		const handler = (window as unknown as { __onGCastApiAvailable: (value: boolean) => void }).__onGCastApiAvailable
		handler(false)
		expect(result.isCastAvailable.value).toBe(false)
		handler(true)
		expect(previous.mock.calls).toEqual([[false], [true]])
		expect(result.isCastAvailable.value).toBe(true)
	})

	it('плеер удалён до загрузки скрипта — подключения нет', () => {
		const { wrapper } = setup()
		wrapper.unmount()
		const cast = installCastSdk()
		;(window as unknown as { __onGCastApiAvailable: (value: boolean) => void }).__onGCastApiAvailable(true)
		expect(cast.context.setOptions).not.toHaveBeenCalled()
	})
})
