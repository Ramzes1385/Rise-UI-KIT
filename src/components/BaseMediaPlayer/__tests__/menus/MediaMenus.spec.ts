import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { formatNumber } from '@/locales/state'
import MediaSlider from '../../ui/controls/MediaSlider.vue'
import MediaSwitch from '../../ui/controls/MediaSwitch.vue'
import { useMediaPip } from '../../model/screen/useMediaPip'
import { useMediaMenus } from '../../model/menus/useMediaMenus'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { MediaMenuList } from '../../types/menus/MediaMenu.types'
import MediaControlButton from '../../ui/controls/MediaControlButton.vue'
import type { MediaMenusSource } from '../../types/controls/MediaControls.types'

const HD = { id: '/media/hd.webm', label: '720p' }
const SD = { id: '/media/sd.webm', label: '360p' }
const RU = { id: '/subs/ru.vtt', label: 'Русский' }
const EN = { id: '/subs/en.srt', label: 'English' }
const STYLE = { size: 100, color: 'white', background: 'semi', position: { x: 50, y: 86 } } as const

function source(patch: Partial<MediaMenusSource> = {}): MediaMenusSource {
	return {
		rate: () => 1,
		qualities: () => [HD, SD],
		activeQualityId: () => SD.id,
		selectQuality: vi.fn(),
		audioOptions: () => [],
		activeAudioId: () => null,
		selectAudio: vi.fn(),
		captionTracks: () => [],
		activeCaptionId: () => null,
		selectCaption: vi.fn(),
		canLoadCaptions: () => false,
		loadCaptions: vi.fn(),
		captionStyle: () => ({ ...STYLE }),
		updateCaptionStyle: vi.fn(),
		...patch,
	}
}

function radios(list: MediaMenuList | undefined): Array<[string, boolean | undefined]> {
	return (list?.items ?? []).filter(item => item.isChecked !== undefined).map(item => [item.label, item.isChecked])
}

describe('меню панели плеера', () => {
	it('текст кнопки скорости — текущая скорость', () => {
		expect(useMediaMenus(source({ rate: () => 1.5 })).rateText.value).toBe('1,5×')
	})

	it('качество и озвучка: варианты, текущий отмечен и виден на кнопке; выбор сообщается', () => {
		const selectQuality = vi.fn()
		const selectAudio = vi.fn()
		const dubs = [
			{ id: null, label: 'Оригинал' },
			{ id: '/audio/a.m4a', label: 'Студия A' },
		]
		const menus = useMediaMenus(source({ selectQuality, selectAudio, audioOptions: () => dubs, activeAudioId: () => '/audio/a.m4a' }))

		expect(menus.qualityMenu.value.title).toBe('Качество')
		expect(radios(menus.qualityMenu.value)).toEqual([
			['720p', false],
			['360p', true],
		])
		expect(menus.qualityText.value).toBe('360p')
		expect(radios(menus.audioMenu.value)).toEqual([
			['Оригинал', false],
			['Студия A', true],
		])
		expect(menus.audioHint.value).toBe('Озвучка: Студия A')
		menus.qualityMenu.value.items[0].onSelect?.()
		menus.audioMenu.value.items[0].onSelect?.()
		expect(selectQuality).toHaveBeenCalledWith(HD.id)
		expect(selectAudio).toHaveBeenCalledWith(null)

		const empty = useMediaMenus(source({ activeQualityId: () => undefined }))
		expect(empty.qualityText.value).toBe('')
		expect(empty.audioHint.value).toBe('Озвучка')
	})

	it('субтитры: «Выкл», дорожки, вид субтитров и загрузка файла', () => {
		const selectCaption = vi.fn()
		const loadCaptions = vi.fn()
		const menus = useMediaMenus(
			source({
				captionTracks: () => [RU, EN],
				activeCaptionId: () => EN.id,
				canLoadCaptions: () => true,
				selectCaption,
				loadCaptions,
			}),
		)
		const menu = menus.captionMenu.value

		expect(menu.title).toBe('Субтитры')
		expect(radios(menu)).toEqual([
			['Выкл', false],
			['Русский', false],
			['English', true],
		])
		expect(menu.items.map(item => item.label).slice(3)).toEqual(['Вид субтитров', 'Загрузить файл субтитров…'])
		menu.items[0].onSelect?.()
		menu.items[1].onSelect?.()
		menu.items[4].onSelect?.()
		expect(selectCaption.mock.calls).toEqual([[null], [RU.id]])
		expect(loadCaptions).toHaveBeenCalledOnce()
	})

	it('субтитры без дорожек — «Выкл» и загрузка; неизвестная дорожка — отмечен «Выкл», без загрузки и вида', () => {
		const onlyUpload = useMediaMenus(source({ canLoadCaptions: () => true })).captionMenu.value
		expect(onlyUpload.items.map(item => item.label)).toEqual(['Выкл', 'Загрузить файл субтитров…'])
		expect(radios(onlyUpload)).toEqual([['Выкл', true]])

		const gone = useMediaMenus(source({ captionTracks: () => [RU], activeCaptionId: () => '/subs/gone.vtt' })).captionMenu.value
		expect(radios(gone)).toEqual([
			['Выкл', true],
			['Русский', false],
		])
		expect(gone.items).toHaveLength(3)
	})

	it('вид субтитров: размер, цвет, фон и положение с текущим значением; списки не закрывают меню', () => {
		const updateCaptionStyle = vi.fn()
		const menus = useMediaMenus(source({ captionTracks: () => [RU], activeCaptionId: () => RU.id, updateCaptionStyle }))
		const style = menus.captionMenu.value.items[2].children as MediaMenuList
		const [size, color, background, position] = style.items

		expect(style.items.map(item => [item.label, item.hint])).toEqual([
			['Размер', formatNumber(1, { style: 'percent' })],
			['Цвет', 'Белый'],
			['Фон', 'Полупрозрачный'],
			['Положение', 'Внизу'],
		])
		expect(size.children?.isKeptOpen).toBe(true)
		expect(radios(size.children).map(([, checked]) => checked)).toEqual([false, true, false, false])
		size.children?.items[2].onSelect?.()
		color.children?.items[1].onSelect?.()
		background.children?.items[0].onSelect?.()
		position.children?.items[1].onSelect?.()
		expect(updateCaptionStyle.mock.calls).toEqual([
			[{ size: 150 }],
			[{ color: 'yellow' }],
			[{ background: 'none' }],
			[{ position: { x: 50, y: 12 } }],
		])
	})

	it('вид субтитров: после перетаскивания положение без значения', () => {
		const menus = useMediaMenus(
			source({
				captionTracks: () => [RU],
				activeCaptionId: () => RU.id,
				captionStyle: () => ({ ...STYLE, position: { x: 30, y: 40 } }),
			}),
		)
		const position = (menus.captionMenu.value.items[2].children as MediaMenuList).items[3]
		expect(position.hint).toBeUndefined()
		expect(radios(position.children)).toEqual([
			['Внизу', false],
			['Вверху', false],
		])
	})
})

describe('кнопки панели', () => {
	it('кнопка: имя и подсказка, текст справа, секунды под иконкой, счётчик; aria-pressed только у переключателя', async () => {
		const { rerender } = render(MediaControlButton, { props: { icon: 'speed', label: 'Скорость воспроизведения', text: '1,5×' } })
		const button = screen.getByRole('button', { name: 'Скорость воспроизведения' })

		expect(button).toHaveAttribute('data-tooltip', 'Скорость воспроизведения')
		expect(button).not.toHaveAttribute('aria-pressed')
		expect(button).toHaveTextContent('1,5×')
		expect(button.querySelector('path')).toHaveAttribute('d', expect.stringMatching(/^M/))

		await rerender({ icon: 'rewind', label: 'Назад на 10 с', caption: '10', badge: 3, isPressed: true })
		expect(screen.getByRole('button', { name: 'Назад на 10 с' })).toHaveAttribute('aria-pressed', 'true')
		expect(button).toHaveClass('base-media-player__control--stacked', 'base-media-player__control--active')
		expect(button.querySelector('.base-media-player__control-badge')).toHaveTextContent('3')
	})

	it('переключатель: role=switch, щелчок сообщает новое значение', async () => {
		const { emitted } = render(MediaSwitch, { props: { label: 'Автовоспроизведение', isChecked: true } })
		const toggle = screen.getByRole('switch', { name: 'Автовоспроизведение' })

		expect(toggle).toHaveAttribute('aria-checked', 'true')
		await fireEvent.click(toggle)
		expect(emitted('update:isChecked')).toEqual([[false]])
	})

	it('вертикальный ползунок громкости: значение снизу вверх, aria-orientation', async () => {
		const { emitted, container } = render(MediaSlider, {
			props: { modelValue: 0.5, max: 1, step: 0.05, largeStep: 0.1, label: 'Громкость', valueText: '50 %', isVertical: true },
		})
		const root = container.querySelector('.base-media-player__slider') as HTMLElement
		root.getBoundingClientRect = () => ({ left: 0, top: 100, bottom: 200, width: 20, height: 100 }) as DOMRect

		expect(screen.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-orientation', 'vertical')
		expect(root).toHaveClass('base-media-player__slider--vertical')
		expect((container.querySelector('.base-media-player__slider-fill') as HTMLElement).style.transform).toBe('scaleY(0.5)')
		expect((container.querySelector('.base-media-player__slider-rail') as HTMLElement).style.transform).toBe('translateY(-50%)')
		await fireEvent.pointerDown(root, { button: 0, pointerId: 1, clientY: 125 })
		await fireEvent.pointerMove(root, { pointerId: 1, clientY: 300 })
		expect(emitted('update:modelValue')).toEqual([[0.75], [0]])

		root.getBoundingClientRect = () => ({ left: 0, top: 0, bottom: 0, width: 20, height: 0 }) as DOMRect
		await fireEvent.pointerMove(root, { pointerId: 1, clientY: 50 })
		expect(emitted('update:modelValue')?.at(-1)).toEqual([0])
	})
})

describe('картинка в картинке', () => {
	afterEach(() => {
		Reflect.deleteProperty(document, 'pictureInPictureEnabled')
		Reflect.deleteProperty(document, 'pictureInPictureElement')
		Reflect.deleteProperty(document, 'exitPictureInPicture')
	})

	it('без поддержки браузера кнопки нет; с поддержкой — вход, выход и состояние по событиям видео', async () => {
		const video = document.createElement('video')
		const media = ref<HTMLMediaElement | null>(video)
		const unsupported = withSetup(() => useMediaPip(media))
		expect(unsupported.result.isPipSupported.value).toBe(false)
		unsupported.wrapper.unmount()

		const state = { element: null as Element | null }
		Object.defineProperty(document, 'pictureInPictureEnabled', { configurable: true, value: true })
		Object.defineProperty(document, 'pictureInPictureElement', { configurable: true, get: () => state.element })
		const exit = vi.fn(async () => {
			state.element = null
		})
		Object.defineProperty(document, 'exitPictureInPicture', { configurable: true, value: exit })
		const request = vi.fn(async () => {
			state.element = video
			return {} as PictureInPictureWindow
		})
		Object.assign(video, { requestPictureInPicture: request })
		const { result, wrapper } = withSetup(() => useMediaPip(media))
		await vi.waitFor(() => expect(result.isPipSupported.value).toBe(true))

		expect(result.pipLabel.value).toBe('Картинка в картинке')
		await result.togglePip()
		video.dispatchEvent(new Event('enterpictureinpicture'))
		expect(request).toHaveBeenCalledOnce()
		expect(result.isPip.value).toBe(true)
		expect(result.pipLabel.value).toBe('Выйти из режима «картинка в картинке»')
		await result.togglePip()
		video.dispatchEvent(new Event('leavepictureinpicture'))
		expect(exit).toHaveBeenCalledOnce()
		expect(result.isPip.value).toBe(false)

		request.mockRejectedValueOnce(new DOMException('no', 'NotAllowedError'))
		await result.togglePip()
		state.element = video
		exit.mockRejectedValueOnce(new DOMException('no', 'InvalidStateError'))
		await result.togglePip()
		expect(exit).toHaveBeenCalledTimes(2)
		media.value = null
		await vi.waitFor(() => expect(result.isPipSupported.value).toBe(false))
		await result.togglePip()
		expect(request).toHaveBeenCalledTimes(2)
		wrapper.unmount()
	})
})
