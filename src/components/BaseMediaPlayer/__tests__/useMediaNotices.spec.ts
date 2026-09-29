import { nextTick, reactive, ref } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import { useMediaBanners } from '../model/useMediaBanners'
import type { MediaState } from '../types/MediaCore.types'
import { useMediaAchievements } from '../model/useMediaAchievements'
import type { MediaAchievement, MediaBanner } from '../types/MediaNotices.types'

function mediaState(): MediaState {
	return reactive({ currentTime: 0, duration: 100, isPaused: false, isEnded: false, isSeeking: false }) as MediaState
}

describe('useMediaBanners', () => {
	const BANNERS: MediaBanner[] = [
		{ id: 'sale', start: 10, end: 20, text: 'Скидка', href: 'https://example.com/sale', image: '/sale.webp' },
		{ id: 'news', start: 15, text: 'Новости', href: 'javascript:alert(1)', image: 'javascript:alert(1)' },
	]

	function setup() {
		const state = mediaState()
		const emitBanner = vi.fn()
		const { result } = withSetup(() => useMediaBanners({ banners: () => BANNERS, state, emitBanner }))
		const events = (): string[] => emitBanner.mock.calls.map(([event]) => `${event.type}:${event.banner.id}`)
		return { result, state, events }
	}

	it('видны в своё время (по умолчанию 10 с); показ, переход и закрытие — события', async () => {
		const { result, state, events } = setup()

		state.currentTime = 12
		await nextTick()
		expect(result.visibleBanners.value.map(banner => banner.id)).toEqual(['sale'])
		state.currentTime = 16
		await nextTick()
		expect(result.visibleBanners.value.map(banner => banner.id)).toEqual(['sale', 'news'])
		result.clickBanner(BANNERS[0])
		result.closeBanner(BANNERS[0])
		expect(result.visibleBanners.value.map(banner => banner.id)).toEqual(['news'])
		state.currentTime = 25
		expect(result.visibleBanners.value).toEqual([])
		expect(events()).toEqual(['show:sale', 'show:news', 'click:sale', 'close:sale'])
	})

	it('небезопасные ссылка и картинка не выводятся', () => {
		const { result } = setup()

		expect([result.bannerLink(BANNERS[0]), result.bannerImage(BANNERS[0])]).toEqual(['https://example.com/sale', '/sale.webp'])
		expect([result.bannerLink(BANNERS[1]), result.bannerImage(BANNERS[1])]).toEqual([undefined, undefined])
		expect([result.bannerLink({ id: 'x', start: 0 }), result.bannerImage({ id: 'x', start: 0 })]).toEqual([undefined, undefined])
	})
})

describe('useMediaAchievements', () => {
	const ACHIEVEMENTS: MediaAchievement[] = [
		{ id: 'start', title: 'Первые минуты', at: 30, icon: '/badges/start.png' },
		{ id: 'finish', title: 'До конца', description: 'Досмотрите серию', at: 'end', icon: 'javascript:alert(1)' },
		{ id: 'manual', title: 'За отзыв' },
	]

	function setup(earned?: string[]) {
		vi.useFakeTimers()
		const state = mediaState()
		const earnedRef = ref(earned)
		const emitAchievement = vi.fn()
		const { result, wrapper } = withSetup(() =>
			useMediaAchievements({ achievements: () => ACHIEVEMENTS, earned: () => earnedRef.value, state, emitAchievement }),
		)
		return { result, wrapper, state, emitAchievement }
	}

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		localStorage.clear()
	})

	it('выдаёт по времени воспроизведения и после досмотра, один раз; уведомления по очереди', async () => {
		const { result, state, emitAchievement } = setup()

		state.isPaused = true
		state.currentTime = 40
		await nextTick()
		state.isPaused = false
		state.isSeeking = true
		state.currentTime = 41
		await nextTick()
		expect(emitAchievement).not.toHaveBeenCalled()
		state.isSeeking = false
		state.currentTime = 42
		await nextTick()
		state.isEnded = true
		await nextTick()
		expect(emitAchievement.mock.calls.map(([item]) => item.id)).toEqual(['start', 'finish'])
		expect(result.achievementToast.value?.id).toBe('start')
		expect(result.achievementIcon.value).toBe('/badges/start.png')
		vi.advanceTimersByTime(5000)
		expect(result.achievementToast.value?.id).toBe('finish')
		expect(result.achievementIcon.value).toBeUndefined()
		result.dismissAchievement()
		expect(result.achievementToast.value).toBeNull()
		state.currentTime = 50
		await nextTick()
		expect(emitAchievement).toHaveBeenCalledTimes(2)
		expect(JSON.parse(localStorage.getItem('rise-media:achievements') as string)).toEqual(['start', 'finish'])
	})

	it('полученные из props и из браузера не выдаются; выдача вручную; неизвестный ключ ничего не делает', () => {
		localStorage.setItem('rise-media:achievements', JSON.stringify(['finish', 7]))
		const { result, emitAchievement, wrapper } = setup(['start'])

		result.awardAchievement('start')
		result.awardAchievement('finish')
		result.awardAchievement('nope')
		result.awardAchievement('manual')
		expect(emitAchievement.mock.calls.map(([item]) => item.id)).toEqual(['manual'])
		wrapper.unmount()
	})

	it('испорченное хранилище и запрет записи не мешают выдаче', () => {
		localStorage.setItem('rise-media:achievements', '{')
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('quota', 'QuotaExceededError')
		})
		const first = setup()
		first.result.awardAchievement('manual')
		expect(first.emitAchievement).toHaveBeenCalledOnce()

		vi.restoreAllMocks()
		localStorage.setItem('rise-media:achievements', '"start"')
		const second = setup()
		second.result.awardAchievement('start')
		expect(second.emitAchievement).toHaveBeenCalledOnce()
	})
})
