import { nextTick, reactive, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useWatchParty } from '../../model/sharing/useWatchParty'
import type { MediaWatchParty } from '../../types/panels/MediaWatch.types'
import type { MediaActions, MediaState } from '../../types/playback/MediaCore.types'

function mediaAt(time: number, rate = 1): HTMLVideoElement {
	const video = document.createElement('video')
	Object.defineProperties(video, { currentTime: { value: time, writable: true }, playbackRate: { value: rate, writable: true } })
	return video
}

function setup(party: MediaWatchParty | undefined = { link: 'https://example.com/watch/room-1' }) {
	const current = ref<MediaWatchParty | undefined>(party)
	const media = ref<HTMLMediaElement | null>(mediaAt(42, 1.5))
	const state = reactive({ currentTime: 10 }) as unknown as MediaState
	const actions = {
		seek: vi.fn(),
		play: vi.fn(async () => undefined),
		pause: vi.fn(),
		setPlaybackRate: vi.fn(),
	} as unknown as MediaActions
	const emitSync = vi.fn()
	const emitInvite = vi.fn()
	const copy = vi.fn()
	const flash = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useWatchParty({ party: () => current.value, media, state, actions, emitSync, emitInvite, copy, flash }),
	)
	return { result, wrapper, current, media, state, actions, emitSync, emitInvite, copy, flash }
}

describe('совместный просмотр', () => {
	afterEach(() => vi.useRealTimers())

	it('запуск, пауза, перемотка и скорость уходят событием watch-sync; без комнаты — не уходят', async () => {
		const { media, current, emitSync, result } = setup()
		const video = media.value as HTMLVideoElement

		for (const type of ['play', 'pause', 'seeked', 'ratechange', 'timeupdate']) video.dispatchEvent(new Event(type))
		expect(emitSync.mock.calls.map(([event]) => event)).toEqual([
			{ type: 'play', time: 42 },
			{ type: 'pause', time: 42 },
			{ type: 'seek', time: 42 },
			{ type: 'rate', time: 42, rate: 1.5 },
		])
		expect(result.hasWatchParty.value).toBe(true)
		current.value = undefined
		await nextTick()
		video.dispatchEvent(new Event('play'))
		expect(emitSync).toHaveBeenCalledTimes(4)
		expect([result.hasWatchParty.value, result.watchLink.value]).toEqual([false, ''])
		result.copyWatchLink()
	})

	it('команда участника применяется: перемотка при расхождении больше 0,5 с, запуск, пауза, скорость — без ответного watch-sync', () => {
		vi.useFakeTimers()
		const { result, actions, media, emitSync, state } = setup()
		const video = media.value as HTMLVideoElement

		result.applyWatchEvent({ type: 'play', time: 30 })
		expect(actions.seek).toHaveBeenCalledWith(30)
		expect(actions.play).toHaveBeenCalledOnce()
		video.dispatchEvent(new Event('seeked'))
		video.dispatchEvent(new Event('play'))
		expect(emitSync).not.toHaveBeenCalled()
		state.currentTime = 30.2
		result.applyWatchEvent({ type: 'pause', time: 30 })
		expect(actions.seek).toHaveBeenCalledOnce()
		expect(actions.pause).toHaveBeenCalledOnce()
		result.applyWatchEvent({ type: 'rate', time: 30, rate: 2 })
		result.applyWatchEvent({ type: 'rate', time: 30 })
		result.applyWatchEvent({ type: 'seek', time: 30 })
		expect(actions.setPlaybackRate).toHaveBeenCalledExactlyOnceWith(2)
		vi.advanceTimersByTime(700)
		video.dispatchEvent(new Event('pause'))
		expect(emitSync).toHaveBeenCalledExactlyOnceWith({ type: 'pause', time: 42 })
	})

	it('участники: инициалы, безопасный аватар, подпись статуса, счётчик смотрящих; ссылка копируется', () => {
		const { result, copy } = setup({
			link: 'https://example.com/watch/room-1',
			members: [
				{ id: 'me', name: 'анна петрова', status: 'joined', isHost: true, avatar: '/me.png' },
				{ id: 'b', name: 'Борис', email: 'boris@example.com', status: 'joined', avatar: 'javascript:alert(1)' },
				{ id: 'c', name: '  Вика  ', status: 'invited' },
			],
		})

		expect(result.watchMembers.value.map(member => [member.initials, member.avatar, member.statusText])).toEqual([
			['АП', '/me.png', 'Ведущий'],
			['Б', undefined, 'Смотрит'],
			['В', undefined, 'Приглашён'],
		])
		expect(result.watchCount.value).toBe(2)
		expect(result.watchLink.value).toBe('https://example.com/watch/room-1')
		result.copyWatchLink()
		expect(copy).toHaveBeenCalledWith('https://example.com/watch/room-1')
	})

	it('приглашение по почте: адрес проверяется, уходит событием watch-invite, зритель видит подтверждение', () => {
		const { result, emitInvite, flash } = setup()

		expect(result.inviteToWatch('не почта')).toBe(false)
		expect(emitInvite).not.toHaveBeenCalled()
		expect(result.inviteToWatch('  anna@example.com ')).toBe(true)
		expect(emitInvite).toHaveBeenCalledWith('anna@example.com')
		expect(flash).toHaveBeenCalledWith('Приглашение отправлено: anna@example.com')
	})

	it('смена элемента и размонтирование снимают обработчики', async () => {
		const { media, emitSync, wrapper } = setup()
		const first = media.value as HTMLVideoElement
		const second = mediaAt(5)

		media.value = second
		await nextTick()
		first.dispatchEvent(new Event('play'))
		second.dispatchEvent(new Event('play'))
		expect(emitSync).toHaveBeenCalledExactlyOnceWith({ type: 'play', time: 5 })
		wrapper.unmount()
		second.dispatchEvent(new Event('pause'))
		expect(emitSync).toHaveBeenCalledOnce()
	})
})
