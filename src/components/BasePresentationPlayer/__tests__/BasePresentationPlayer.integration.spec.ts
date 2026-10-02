import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'
import type { PresentationWrapper } from './utils/presentation.test-utils'
import MediaSlider from '@components/BaseMediaPlayer/ui/controls/MediaSlider.vue'
import { button, fakeAudio, mountPresentation, slidesOf, statusText, stubMediaPrototype } from './utils/presentation.test-utils'

type Exposed = { play: () => void; pause: () => void; next: () => void; previous: () => void; goTo: (index: number) => void }

const exposed = (wrapper: PresentationWrapper) => wrapper.vm as unknown as Exposed

describe('BasePresentationPlayer integration', () => {
	it('стрелка вправо внутри плеера переключает слайд', async () => {
		stubMediaPrototype()
		const user = userEvent.setup()
		const { emitted } = render(BasePresentationPlayer, { props: { title: 'Курс', slides: slidesOf(2) } })
		screen.getByRole('button', { name: 'Следующий слайд' }).focus()
		await user.keyboard('{ArrowRight}')
		expect(emitted('update:slide')).toEqual([[1]])
	})

	it('free: клавиши листают свободно — →, ←, End, Home, цифры, Shift+N, Shift+P, J, L', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(10) })
		const root = wrapper.get('[role="region"]')
		const press = async (code: string, shiftKey = false) => root.trigger('keydown', { code, shiftKey })
		await press('ArrowRight')
		await press('End')
		await press('ArrowLeft')
		await press('Home')
		await press('Digit5')
		await press('KeyN', true)
		await press('KeyP', true)
		await press('KeyL')
		await press('KeyJ')
		expect(wrapper.emitted('update:slide')).toEqual([[1], [9], [8], [0], [5], [6], [5], [6], [5]])
	})

	it('клавиши плеера без смысла для презентации (T, C) ничего не делают', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		const root = wrapper.get('[role="region"]')
		await root.trigger('keydown', { code: 'KeyT' })
		await root.trigger('keydown', { code: 'KeyC' })
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(wrapper.emitted('play')).toBeUndefined()
	})

	it('пока озвучка грузится во время показа — индикатор загрузки', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { audio: '/a.webm' }) })
		const audio = fakeAudio(wrapper, { duration: 5 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.emit('waiting')
		await nextTick()
		expect(wrapper.find('.base-media-player__loader').attributes('role')).toBe('status')
		audio.emit('canplay')
		await nextTick()
		expect(wrapper.find('.base-media-player__loader').exists()).toBe(false)
	})

	it('hasKeyboardShortcuts=false выключает горячие клавиши', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(3), hasKeyboardShortcuts: false })
		await wrapper.get('[role="region"]').trigger('keydown', { code: 'ArrowRight' })
		expect(wrapper.emitted('update:slide')).toBeUndefined()
	})

	it('Space и K — пауза и запуск, M — звук, ↑/↓ — громкость', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { audio: '/a.webm' }) })
		const audio = fakeAudio(wrapper, { duration: 5 })
		const root = wrapper.get('[role="region"]')
		await root.trigger('keydown', { code: 'KeyK' })
		expect(wrapper.emitted('play')).toHaveLength(1)
		await root.trigger('keydown', { code: 'Space' })
		expect(wrapper.emitted('pause')).toHaveLength(1)
		await root.trigger('keydown', { code: 'ArrowDown' })
		await nextTick()
		expect(audio.values.volume).toBeCloseTo(0.95)
		await root.trigger('keydown', { code: 'KeyM' })
		await nextTick()
		expect(audio.values.muted).toBe(true)
		expect(wrapper.find('button[aria-label="Включить звук"]').exists()).toBe(true)
		await root.trigger('keydown', { code: 'ArrowUp' })
		await nextTick()
		expect(audio.values.muted).toBe(false)
	})

	it('кнопка звука и вертикальная громкость', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { audio: '/a.webm' }) })
		const audio = fakeAudio(wrapper, { duration: 5 })
		const volume = wrapper.findAllComponents(MediaSlider)[1]
		volume.vm.$emit('update:modelValue', 0.2)
		await nextTick()
		expect(audio.values.volume).toBeCloseTo(0.2)
		expect(volume.props('valueText')).toMatch(/^20\s%$/)
		volume.vm.$emit('update:modelValue', 0.5)
		await nextTick()
		await button(wrapper, 'Выключить звук').trigger('click')
		expect(volume.props('modelValue')).toBe(0)
		expect(audio.values.muted).toBe(true)
		await button(wrapper, 'Включить звук').trigger('click')
		expect(volume.props('modelValue')).toBeCloseTo(0.5)
		volume.vm.$emit('update:modelValue', 0)
		await nextTick()
		expect(volume.props('valueText')).toMatch(/^0\s%$/)
		volume.vm.$emit('update:modelValue', 0.9)
		await nextTick()
		expect(volume.props('modelValue')).toBeCloseTo(0.9)
	})

	it('v-model:slide: проп задаёт слайд в пределах списка, укороченный список сдвигает номер', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(5), slide: 3 })
		expect(statusText(wrapper)).toBe('Слайд 4 из 5: Слайд-4')
		await wrapper.setProps({ slide: 99 })
		expect(wrapper.get('.base-media-player__time').text()).toBe('5 / 5')
		await wrapper.setProps({ slide: undefined })
		expect(wrapper.get('.base-media-player__time').text()).toBe('5 / 5')
		await wrapper.setProps({ slides: slidesOf(2) })
		expect(wrapper.get('.base-media-player__time').text()).toBe('2 / 2')
	})

	it('expose: play, pause, next, previous, goTo', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(4) })
		exposed(wrapper).play()
		await nextTick()
		exposed(wrapper).pause()
		await nextTick()
		exposed(wrapper).next()
		exposed(wrapper).goTo(3)
		exposed(wrapper).next()
		exposed(wrapper).previous()
		exposed(wrapper).goTo(2)
		await nextTick()
		expect(wrapper.emitted('play')).toHaveLength(1)
		expect(wrapper.emitted('pause')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toEqual([[1], [3], [2]])
	})

	it('«Предыдущий слайд» на первом — aria-disabled и без действия', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		const previous = button(wrapper, 'Предыдущий слайд')
		expect(previous.attributes('aria-disabled')).toBe('true')
		await previous.trigger('click')
		expect(wrapper.emitted('update:slide')).toBeUndefined()
	})

	it('шкала: стрелки — соседний слайд, клик по другому слайду — его начало, подсказка — номер и название', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(3, { duration: 4 }) })
		const slider = wrapper.get('[role="slider"][aria-label="Слайды"]')
		expect(slider.attributes('aria-valuetext')).toBe('Слайд 1 из 3: Слайд-1')
		await slider.trigger('keydown', { key: 'ArrowRight', code: 'ArrowRight' })
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		const seek = wrapper.findAllComponents(MediaSlider)[0]
		seek.vm.$emit('update:modelValue', 2.6)
		await nextTick()
		expect(wrapper.emitted('update:slide')).toEqual([[1], [2]])
		expect(seek.props('modelValue')).toBe(2)
		expect((seek.props('hoverText') as (value: number) => string)(1.4)).toBe('2. Слайд-2')
		expect(seek.props('segments')).toEqual([
			{ start: 0, end: 1 },
			{ start: 1, end: 2 },
			{ start: 2, end: 3 },
		])
	})

	it('шкала внутри слайда без известной длительности не перематывает', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		wrapper.findAllComponents(MediaSlider)[0].vm.$emit('update:modelValue', 0.5)
		await nextTick()
		expect(wrapper.findAllComponents(MediaSlider)[0].props('modelValue')).toBe(0)
	})

	it('слот slide заменяет картинку; клик по кнопке слота не ставит паузу; большая кнопка Play запускает', async () => {
		const wrapper = await mountPresentation(
			{ slides: slidesOf(2, { duration: 5 }) },
			{
				slots: {
					slide: ({ slide, index }: { slide: { title: string }; index: number }) =>
						h('div', [h('h2', `${index + 1}: ${slide.title}`), h('button', 'Ответ')]),
				},
			},
		)
		expect(wrapper.get('h2').text()).toBe('1: Слайд-1')
		expect(wrapper.find('img').exists()).toBe(false)
		await wrapper.get('.base-media-player__big-play').trigger('click')
		expect(wrapper.emitted('play')).toHaveLength(1)
		expect(wrapper.find('.base-media-player__start').exists()).toBe(false)
		await wrapper.get('.base-presentation-player__slide button').trigger('click')
		expect(wrapper.emitted('pause')).toBeUndefined()
	})

	it('название над кадром с названием слайда; hasTitle=false его скрывает', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		expect(wrapper.get('.base-media-player__top').text()).toBe('Курс · Слайд-1')
		await wrapper.setProps({ hasTitle: false })
		expect(wrapper.find('.base-media-player__top').exists()).toBe(false)
	})

	it('меню скорости открывается кнопкой и меняет скорость', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { audio: '/a.webm' }) })
		const audio = fakeAudio(wrapper, { duration: 5 })
		await button(wrapper, 'Скорость воспроизведения').trigger('click')
		const item = wrapper.findAll('[role="menuitemradio"]').find(node => node.text().includes('1,5×'))
		await item?.trigger('click')
		await nextTick()
		expect(audio.values.playbackRate).toBe(1.5)
		expect(button(wrapper, 'Скорость воспроизведения').text()).toContain('1,5×')
	})

	it('полный экран — кнопка, подпись и клавиша F', async () => {
		Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true })
		const request = vi.fn(async function (this: Element) {
			Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: this })
			document.dispatchEvent(new Event('fullscreenchange'))
		})
		Element.prototype.requestFullscreen = request
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		await button(wrapper, 'Во весь экран').trigger('click')
		await nextTick()
		expect(request).toHaveBeenCalled()
		expect(wrapper.find('button[aria-label="Выйти из полноэкранного режима"]').exists()).toBe(true)
		Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null })
		document.dispatchEvent(new Event('fullscreenchange'))
		await wrapper.get('[role="region"]').trigger('keydown', { code: 'KeyF' })
		expect(request).toHaveBeenCalledTimes(2)
		Reflect.deleteProperty(document, 'fullscreenEnabled')
		Reflect.deleteProperty(document, 'fullscreenElement')
	})

	it('значения по умолчанию берутся из defaults плагина', async () => {
		stubMediaPrototype()
		render(BasePresentationPlayer, {
			props: { title: 'Курс', slides: slidesOf(2) },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePresentationPlayer: { hasTitle: false, aspectRatio: '4 / 3' } } })] },
		})
		expect(screen.getByRole('region', { name: 'Курс' })).toHaveStyle({ aspectRatio: '4 / 3' })
		expect(document.querySelector('.base-media-player__top')).toBeNull()
	})
})
