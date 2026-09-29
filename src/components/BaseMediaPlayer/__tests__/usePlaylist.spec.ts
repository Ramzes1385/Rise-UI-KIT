import { nextTick, reactive, ref } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import type { MediaState } from '../types/MediaCore.types'
import { useMediaChapters } from '../model/useMediaChapters'
import { useMediaPlaylist } from '../model/useMediaPlaylist'
import { useNextCountdown } from '../model/useNextCountdown'
import type { MediaChapter, MediaPlaylist } from '../types/MediaPlaylist.types'

const SEASONS: MediaPlaylist[] = [
	{
		id: 's1',
		title: 'Сезон 1',
		episodes: [
			{ id: 'e1', title: 'Серия 1', sources: '/e1.webm' },
			{ id: 'e2', title: 'Серия 2', sources: '/e2.webm' },
		],
	},
	{ id: 's2', title: 'Сезон 2', episodes: [{ id: 'e3', title: 'Серия 3', sources: '/e3.webm' }] },
]

function mediaState(patch: Partial<MediaState> = {}): MediaState {
	return reactive({ currentTime: 0, duration: 100, isEnded: false, isPaused: true, ...patch }) as MediaState
}

describe('useMediaPlaylist', () => {
	function setup(initial?: string) {
		const episode = ref<string | undefined>(initial)
		const playlists = ref<MediaPlaylist[] | undefined>(SEASONS)
		const emitEpisode = vi.fn()
		const playlist = useMediaPlaylist({ playlists: () => playlists.value, episode: () => episode.value, emitEpisode })
		return { playlist, episode, playlists, emitEpisode }
	}

	it('без выбора — первая серия; следующая переходит в другой сезон', () => {
		const { playlist, emitEpisode } = setup()

		expect(playlist.currentEpisode.value?.id).toBe('e1')
		expect(playlist.previousEpisode.value).toBeNull()
		playlist.playNext()
		playlist.playNext()
		expect(playlist.currentEntry.value?.playlist.id).toBe('s2')
		expect(playlist.nextEpisode.value).toBeNull()
		playlist.playNext()
		expect(emitEpisode.mock.calls).toEqual([['e2'], ['e3']])
		playlist.playPrevious()
		expect(playlist.currentEpisode.value?.id).toBe('e2')
	})

	it('v-model:episode и выбор из списка; неизвестная и текущая серия не выбираются', () => {
		const { playlist, episode, emitEpisode } = setup('e2')

		expect(playlist.previousEpisode.value?.id).toBe('e1')
		playlist.selectEpisode('e2')
		playlist.selectEpisode('nope')
		expect(emitEpisode).not.toHaveBeenCalled()
		episode.value = 'missing'
		expect(playlist.currentEpisode.value?.id).toBe('e1')
		playlist.playPrevious()
		expect(emitEpisode).not.toHaveBeenCalled()
	})

	it('без плейлистов серий нет', () => {
		const { playlist, playlists } = setup()
		playlists.value = undefined

		expect([playlist.currentEpisode.value, playlist.nextEpisode.value, playlist.previousEpisode.value]).toEqual([null, null, null])
		expect(playlist.playlists.value).toEqual([])
		playlist.playNext()
	})
})

describe('useMediaChapters', () => {
	const CHAPTERS: MediaChapter[] = [
		{ start: 90, title: 'Опенинг', kind: 'intro', end: 180 },
		{ start: 0, title: 'Пролог' },
		{ start: Number.NaN, title: 'Сломанная' },
		{ start: 180, title: 'Серия' },
	]

	it('главы по порядку, конец — начало следующей или конец записи; текущая глава и отрезок для пропуска', () => {
		const state = mediaState({ currentTime: 100 })
		const chapters = useMediaChapters({ chapters: () => CHAPTERS, state })

		expect(chapters.chapters.value.map(chapter => [chapter.title, chapter.start, chapter.end])).toEqual([
			['Пролог', 0, 90],
			['Опенинг', 90, 180],
			['Серия', 180, 100],
		])
		expect(chapters.chapterMarks.value).toEqual([0, 90, 180])
		expect(chapters.currentChapter.value?.title).toBe('Опенинг')
		expect(chapters.skipChapter.value?.kind).toBe('intro')
		state.currentTime = 10
		expect(chapters.skipChapter.value).toBeNull()
		expect(chapters.chapterAt(500)).toBeNull()
	})

	it('без длительности последняя глава идёт до конца; без глав — пусто', () => {
		const state = mediaState({ duration: Number.NaN })
		expect(useMediaChapters({ chapters: () => [{ start: 5, title: 'Одна' }], state }).chapters.value[0].end).toBe(
			Number.POSITIVE_INFINITY,
		)
		expect(useMediaChapters({ chapters: () => undefined, state }).chapters.value).toEqual([])
	})
})

describe('useNextCountdown', () => {
	function setup(options: { seconds?: number; isEnabled?: boolean; hasNext?: boolean } = {}) {
		vi.useFakeTimers()
		const state = mediaState()
		const isEnabled = ref(options.isEnabled ?? true)
		const playNext = vi.fn()
		const { result, wrapper } = withSetup(() =>
			useNextCountdown({
				seconds: () => options.seconds ?? 5,
				isEnabled: () => isEnabled.value,
				hasNext: () => options.hasNext ?? true,
				state,
				playNext,
			}),
		)
		return { result, wrapper, state, isEnabled, playNext }
	}

	afterEach(() => {
		vi.useRealTimers()
	})

	it('после конца считает секунды и включает следующую серию', async () => {
		const { result, state, playNext } = setup({ seconds: 3 })

		state.isEnded = true
		await nextTick()
		expect(result.nextCountdown.value).toBe(3)
		vi.advanceTimersByTime(2000)
		expect(result.nextCountdown.value).toBe(1)
		vi.advanceTimersByTime(1000)
		expect(result.nextCountdown.value).toBeNull()
		expect(playNext).toHaveBeenCalledOnce()
	})

	it('отмена, повторный запуск, выключенный автопереход и «Смотреть» сразу', async () => {
		const { result, state, isEnabled, playNext } = setup()

		state.isEnded = true
		await nextTick()
		result.cancelNext()
		vi.advanceTimersByTime(10_000)
		expect(playNext).not.toHaveBeenCalled()
		state.isEnded = false
		await nextTick()
		state.isEnded = true
		await nextTick()
		isEnabled.value = false
		await nextTick()
		expect(result.nextCountdown.value).toBeNull()
		isEnabled.value = true
		await nextTick()
		result.playNextNow()
		expect(playNext).toHaveBeenCalledOnce()
	})

	it('без следующей серии или при выключенном автопереходе отсчёта нет; 0 — переход сразу', async () => {
		const noNext = setup({ hasNext: false })
		noNext.state.isEnded = true
		await nextTick()
		expect(noNext.result.nextCountdown.value).toBeNull()

		const disabled = setup({ isEnabled: false })
		disabled.state.isEnded = true
		await nextTick()
		expect(disabled.result.nextCountdown.value).toBeNull()

		const instant = setup({ seconds: 0 })
		instant.state.isEnded = true
		await nextTick()
		expect(instant.playNext).toHaveBeenCalledOnce()
		instant.wrapper.unmount()
	})
})
