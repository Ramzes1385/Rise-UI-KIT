import { nextTick, reactive, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { usePlaybackMemory } from '../../model/core/usePlaybackMemory'
import type { MediaActions, MediaState } from '../../types/playback/MediaCore.types'

function setup(options: { storageKey?: string; startTime?: number | null } = {}) {
	const state = reactive({ currentTime: 0, duration: Number.NaN, isPaused: true, isEnded: false }) as MediaState
	const actions = { seek: vi.fn(), play: vi.fn(async () => undefined) } as unknown as MediaActions
	const key = ref(options.storageKey)
	const { result } = withSetup(() =>
		usePlaybackMemory({ state, actions, storageKey: () => key.value, startTime: () => options.startTime ?? null }),
	)
	return { state, actions, result, key }
}

describe('usePlaybackMemory', () => {
	afterEach(() => {
		localStorage.clear()
	})

	it('предлагает продолжить с сохранённой позиции; «Продолжить» перематывает и запускает', async () => {
		localStorage.setItem('rise-media:ep1', '42')
		const { state, actions, result } = setup({ storageKey: 'ep1' })

		state.duration = 100
		await nextTick()
		expect(result.resumeTime.value).toBe(42)
		result.resume()
		expect(actions.seek).toHaveBeenCalledWith(42)
		expect(actions.play).toHaveBeenCalledOnce()
		expect(result.resumeTime.value).toBeNull()
	})

	it('«Сначала» и запуск воспроизведения убирают предложение; позиция у края не предлагается', async () => {
		localStorage.setItem('rise-media:ep1', '42')
		const first = setup({ storageKey: 'ep1' })
		first.state.duration = 100
		await nextTick()
		first.result.dismissResume()
		expect(first.result.resumeTime.value).toBeNull()

		const second = setup({ storageKey: 'ep1' })
		second.state.duration = 100
		await nextTick()
		second.state.isPaused = false
		await nextTick()
		expect(second.result.resumeTime.value).toBeNull()

		localStorage.setItem('rise-media:ep1', '98')
		const edge = setup({ storageKey: 'ep1' })
		edge.state.duration = 100
		await nextTick()
		expect(edge.result.resumeTime.value).toBeNull()
		edge.result.resume()
		expect(edge.actions.seek).not.toHaveBeenCalled()
	})

	it('позиция из адреса важнее сохранённой; без ключа ничего не хранится', async () => {
		localStorage.setItem('rise-media:ep1', '42')
		const fromUrl = setup({ storageKey: 'ep1', startTime: 30 })
		fromUrl.state.duration = 100
		await nextTick()
		expect(fromUrl.actions.seek).toHaveBeenCalledWith(30)
		expect(fromUrl.result.resumeTime.value).toBeNull()

		const noKey = setup()
		noKey.state.duration = 100
		noKey.state.currentTime = 20
		await nextTick()
		expect(noKey.result.resumeTime.value).toBeNull()
		expect(localStorage.length).toBe(1)
	})

	it('сохраняет позицию раз в 5 секунд и на паузе, в конце записи — удаляет', async () => {
		vi.useFakeTimers()
		const { state } = setup({ storageKey: 'ep2' })
		state.currentTime = 3
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBeNull()
		state.duration = 100
		await nextTick()
		vi.advanceTimersByTime(5000)
		state.currentTime = 12
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBe('12')

		state.currentTime = 14
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBe('12')
		vi.advanceTimersByTime(5000)
		state.currentTime = 20
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBe('20')

		state.isPaused = false
		await nextTick()
		state.currentTime = 33
		state.isPaused = true
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBe('33')

		state.isPaused = false
		await nextTick()
		Object.assign(state, { isEnded: true, isPaused: true, currentTime: 100 })
		await nextTick()
		expect(localStorage.getItem('rise-media:ep2')).toBeNull()
		vi.useRealTimers()
	})

	it('недоступное хранилище не ломает плеер', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('denied')
		})
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('denied')
		})
		const { state, result } = setup({ storageKey: 'ep3' })
		state.duration = 100
		state.currentTime = 50
		await nextTick()
		expect(result.resumeTime.value).toBeNull()
	})

	it('новая серия — новый ключ: позиция читается после загрузки её метаданных, до этого не сохраняется', async () => {
		localStorage.setItem('rise-media:show:e1', '20')
		localStorage.setItem('rise-media:show:e2', '55')
		const { state, result, key } = setup({ storageKey: 'show:e1' })
		state.duration = 100
		await nextTick()
		expect(result.resumeTime.value).toBe(20)

		key.value = 'show:e2'
		await nextTick()
		expect(result.resumeTime.value).toBeNull()
		state.currentTime = 70
		state.isPaused = false
		await nextTick()
		state.isPaused = true
		await nextTick()
		expect(localStorage.getItem('rise-media:show:e2')).toBe('55')

		state.duration = Number.NaN
		await nextTick()
		state.duration = 120
		await nextTick()
		expect(result.resumeTime.value).toBe(55)
		state.duration = Number.NaN
		await nextTick()
		state.duration = 120
		await nextTick()
		expect(result.resumeTime.value).toBe(55)
	})
})
