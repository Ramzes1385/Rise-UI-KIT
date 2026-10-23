import '@testing-library/jest-dom/vitest'
import MediaSlider from '@components/BaseMediaPlayer/ui/controls/MediaSlider.vue'
import { fakeMedia } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'
import { button, fakeAudio, mountPresentation, setVisibility, slidesOf } from '../utils/presentation.test-utils'

const voiced = (count: number, extra = {}) =>
	slidesOf(count).map((slide, index) => ({ ...slide, audio: `/voice-${index + 1}.webm`, ...extra }))

const shared = [
	{ id: 's1', title: 'Слайд-1', image: '/1.png', at: 0 },
	{ id: 's2', title: 'Слайд-2', image: '/2.png', at: 10 },
	{ id: 's3', title: 'Слайд-3', image: '/3.png', at: 20 },
]

describe('BasePresentationPlayer — озвучка', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		setVisibility('visible')
		vi.useRealTimers()
	})

	it('озвучка слайда: показ идёт до её конца и переходит дальше, адрес — из слайда', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2) })
		const audio = fakeAudio(wrapper, { duration: 8 })
		expect(wrapper.get('audio').attributes('src')).toBe('/voice-1.webm')
		await button(wrapper, 'Воспроизвести').trigger('click')
		expect(audio.play).toHaveBeenCalled()
		expect(wrapper.emitted('play')).toHaveLength(1)
		audio.update({ ended: true, paused: true, currentTime: 8 }, 'ended')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.get('audio').attributes('src')).toBe('/voice-2.webm')
		expect(audio.play).toHaveBeenCalledTimes(2)
	})

	it('linear: конец озвучки раньше minDuration — показ ждёт и переходит сам, когда время набрано', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2, { minDuration: 5 }), navigation: 'linear' })
		const audio = fakeAudio(wrapper, { duration: 2 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(2000)
		audio.update({ ended: true, paused: true, currentTime: 2 }, 'ended')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(button(wrapper, 'Следующий слайд').attributes('aria-disabled')).toBe('true')
		await vi.advanceTimersByTimeAsync(3100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('linear: конец озвучки после minDuration — переход сразу', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2, { minDuration: 1 }), navigation: 'linear' })
		const audio = fakeAudio(wrapper, { duration: 4 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(4000)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		audio.update({ ended: true, paused: true, currentTime: 4 }, 'ended')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('подсказка замка учитывает остаток озвучки и скорость; без длительности — «Доступно после озвучки»', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2), navigation: 'linear' })
		const hint = () => wrapper.get('.base-presentation-player__next .base-media-player__visually-hidden').text()
		await vi.advanceTimersByTimeAsync(0)
		expect(hint()).toBe('Доступно после озвучки')
		fakeAudio(wrapper, { duration: 10, currentTime: 4 })
		await vi.advanceTimersByTimeAsync(0)
		expect(hint()).toBe('Доступно через 6 с')
		;(
			(wrapper.vm.$ as unknown as { setupState: unknown }).setupState as {
				speedMenu: { items: Array<{ label: string; onSelect: () => void }> }
			}
		).speedMenu.items
			.find(item => item.label === '2×')
			?.onSelect()
		await vi.advanceTimersByTimeAsync(0)
		expect(hint()).toBe('Доступно через 3 с')
	})

	it('внешняя пауза озвучки ставит показ на паузу, пауза на конце — нет', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2) })
		const audio = fakeAudio(wrapper, { duration: 8 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ paused: true }, 'pause')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('pause')).toHaveLength(1)
		audio.update({ paused: false }, 'play')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('play')).toHaveLength(2)
	})

	it('ошибка озвучки останавливает показ', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2) })
		const audio = fakeAudio(wrapper, { duration: 8 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ error: { code: 4 } }, 'error')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('pause')).toHaveLength(1)
	})

	it('видео-слайд без озвучки звучит сам; с озвучкой — без звука и по кругу', async () => {
		const wrapper = await mountPresentation({
			slides: [
				{ id: 'v', title: 'Видео', video: '/v.webm' },
				{ id: 'w', title: 'Ещё', video: '/w.webm', audio: '/a.webm' },
			],
		})
		const video = wrapper.get('video')
		expect(video.attributes('aria-label')).toBe('Видео')
		expect((video.element as HTMLVideoElement).muted).toBe(false)
		expect(video.attributes('loop')).toBeUndefined()
		await button(wrapper, 'Следующий слайд').trigger('click')
		await vi.advanceTimersByTimeAsync(500)
		const next = wrapper.get('video')
		expect((next.element as HTMLVideoElement).muted).toBe(true)
		expect(next.attributes('loop')).toBeDefined()
	})

	it('общая дорожка: слайд меняется по времени, переход к слайду перематывает дорожку на его at', async () => {
		const wrapper = await mountPresentation({ slides: shared, audio: '/track.webm' })
		const audio = fakeAudio(wrapper, { duration: 30 })
		expect(wrapper.get('audio').attributes('src')).toBe('/track.webm')
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ currentTime: 12 }, 'timeupdate')
		await vi.advanceTimersByTimeAsync(50)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		await button(wrapper, 'Следующий слайд').trigger('click')
		expect(audio.values.currentTime).toBe(20)
		const slider = wrapper.get('[role="slider"][aria-label="Слайды"]')
		expect(slider.attributes('aria-valuetext')).toBe('Слайд 3 из 3: Слайд-3')
	})

	it('общая дорожка, linear: дошла до следующего слайда раньше minDuration — пауза на границе, затем переход и продолжение', async () => {
		const slides = shared.map(slide => ({ ...slide, minDuration: 15 }))
		const wrapper = await mountPresentation({ slides, audio: '/track.webm', navigation: 'linear' })
		const audio = fakeAudio(wrapper, { duration: 30 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(10_000)
		audio.update({ currentTime: 10 }, 'timeupdate')
		await vi.advanceTimersByTimeAsync(50)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(wrapper.emitted('pause')).toHaveLength(1)
		await vi.advanceTimersByTimeAsync(5100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.emitted('play')).toHaveLength(2)
	})

	it('перемотка внутри слайда со своей озвучкой и на общей дорожке', async () => {
		const own = await mountPresentation({ slides: voiced(2) })
		const audio = fakeAudio(own, { duration: 10 })
		await vi.advanceTimersByTimeAsync(0)
		const slider = own.findAllComponents(MediaSlider)[0]
		slider.vm.$emit('update:modelValue', 0.5)
		expect(audio.values.currentTime).toBe(5)
		own.unmount()
		const track = await mountPresentation({ slides: shared, audio: '/track.webm', slide: 1 })
		const trackAudio = fakeAudio(track, { duration: 30 })
		await vi.advanceTimersByTimeAsync(0)
		track.findAllComponents(MediaSlider)[0].vm.$emit('update:modelValue', 1.5)
		expect(trackAudio.values.currentTime).toBe(15)
	})

	it('видео-слайд управляет показом своими событиями play и pause', async () => {
		const wrapper = await mountPresentation({ slides: [{ id: 'v', title: 'Видео', video: '/v.webm' }] })
		const video = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 6 })
		video.emit('loadedmetadata')
		video.update({ paused: false }, 'play')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('play')).toHaveLength(1)
		video.update({ paused: true }, 'pause')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('pause')).toHaveLength(1)
	})

	it('при общей дорожке события беззвучного видео слайда показ не трогают', async () => {
		const wrapper = await mountPresentation({ slides: [{ id: 'v', title: 'Видео', video: '/v.webm', at: 0 }], audio: '/track.webm' })
		fakeAudio(wrapper, { duration: 6 })
		const video = wrapper.get('video')
		await video.trigger('play')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('play')).toBeUndefined()
		await button(wrapper, 'Воспроизвести').trigger('click')
		await video.trigger('pause')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('pause')).toBeUndefined()
	})

	it('после ошибки новая загрузка (emptied) сбрасывает ошибку, показ можно запустить снова', async () => {
		const wrapper = await mountPresentation({ slides: voiced(2) })
		const audio = fakeAudio(wrapper, { duration: 8 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ error: { code: 2 } }, 'error')
		await vi.advanceTimersByTimeAsync(0)
		audio.update({ error: null }, 'emptied')
		await vi.advanceTimersByTimeAsync(0)
		await button(wrapper, 'Воспроизвести').trigger('click')
		expect(wrapper.emitted('play')).toHaveLength(2)
	})

	it('адреса с небезопасной схемой отбрасываются', async () => {
		const wrapper = await mountPresentation({
			slides: [{ id: 'x', title: 'X', image: 'javascript:alert(1)', audio: 'javascript:void(0)' }],
		})
		expect(wrapper.find('img').exists()).toBe(false)
		expect(wrapper.get('audio').attributes('src')).toBeUndefined()
	})
})
