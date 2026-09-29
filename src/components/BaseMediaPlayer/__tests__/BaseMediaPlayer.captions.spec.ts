import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { playerMenu, fakeMedia } from './BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../types/BaseMediaPlayer.types'

const SOURCE = '/media/demo.webm'

const TRACKS = [
	{ src: '/subs/ru.vtt', label: 'Русский', srclang: 'ru', isDefault: true },
	{ src: '/subs/en.srt', label: 'English', srclang: 'en' },
]

const FILES: Record<string, string> = {
	'/subs/ru.vtt': 'WEBVTT\n\n00:00.000 --> 00:05.000\nПривет, <i>мир</i>\n\n00:05.000 --> 00:10.000\nВторая реплика',
	'/subs/en.srt': '1\n00:00:00,000 --> 00:00:10,000\nHello\n',
}

const SRT_FILE = '1\n00:00:00,000 --> 00:00:10,000\nИз файла зрителя\n'

function stubFetch(): void {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string) => (url in FILES ? new Response(FILES[url]) : new Response('', { status: 404 }))),
	)
}

async function setup(props: Partial<BaseMediaPlayerProps> = {}) {
	stubFetch()
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const result = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', tracks: TRACKS, ...props } })
	const video = result.container.querySelector('video') as HTMLVideoElement
	const root = result.container.querySelector('.base-media-player') as HTMLElement
	const fake = fakeMedia(video, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	const captions = (): string =>
		[...root.querySelectorAll('.base-media-player__caption-line')].map(line => line.textContent?.trim()).join('\n')
	const flash = (): string => root.querySelector('.base-media-player__flash')?.textContent ?? ''
	return { ...result, video, root, fake, captions, flash }
}

function dragEvent(type: string, init: { types?: string[]; files?: File[]; relatedTarget?: Node | null } = {}): Event {
	const event = new Event(type, { bubbles: true, cancelable: true })
	Object.defineProperty(event, 'dataTransfer', { value: init.types ? { types: init.types, files: init.files ?? [] } : null })
	Object.defineProperty(event, 'relatedTarget', { value: init.relatedTarget ?? null })
	return event
}

async function chooseFiles(input: HTMLInputElement, files: File[]): Promise<void> {
	Object.defineProperty(input, 'files', { configurable: true, value: files })
	input.dispatchEvent(new Event('change'))
	await nextTick()
}

async function dispatch(target: EventTarget, event: Event): Promise<boolean> {
	const isAllowed = target.dispatchEvent(event)
	await nextTick()
	return isAllowed
}

describe('BaseMediaPlayer: субтитры', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		localStorage.clear()
	})

	it('дорожка по умолчанию, реплика по позиции, кнопка «Субтитры» и клавиша C', async () => {
		const { root, fake, captions, flash, emitted } = await setup()
		const button = screen.getByRole('button', { name: 'Субтитры' })

		await vi.waitFor(() => expect(captions()).toBe('Привет, мир'))
		expect(root.querySelector('.base-media-player__caption--italic')).toHaveTextContent('мир')
		expect(button).toHaveClass('base-media-player__control--active')
		expect(button).toHaveAttribute('aria-haspopup', 'menu')
		fake.update({ currentTime: 6 }, 'seeked')
		await nextTick()
		expect(captions()).toBe('Вторая реплика')

		await fireEvent.keyDown(root, { code: 'KeyC' })
		expect(button).not.toHaveClass('base-media-player__control--active')
		expect(root.querySelector('.base-media-player__captions')).toBeNull()
		expect(flash()).toBe('Субтитры выключены')
		await fireEvent.keyDown(root, { code: 'KeyC' })
		expect(captions()).toBe('Вторая реплика')
		expect(flash()).toBe('Субтитры: Русский')
		expect(emitted('update:textTrack')).toEqual([['/subs/ru.vtt'], [null], ['/subs/ru.vtt']])
	})

	it('меню субтитров: дорожки, вид субтитров и загрузка файла', async () => {
		stubFetch()
		const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)
		const wrapper = mount(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', tracks: TRACKS }, attachTo: document.body })
		const menu = playerMenu(wrapper, 'Субтитры')
		await vi.waitFor(() => expect(wrapper.find('.base-media-player__caption-line').exists()).toBe(true))

		expect(menu.options()).toEqual(['Выкл', 'Русский', 'English'])
		expect(menu.checked()).toBe('Русский')
		const style = menu.submenu('Вид субтитров')
		expect(style.map(item => `${item.label}: ${item.hint?.replace(/\s/g, ' ')}`)).toEqual([
			'Размер: 100 %',
			'Цвет: Белый',
			'Фон: Полупрозрачный',
			'Положение: Внизу',
		])
		menu.pick('English')
		style[1].children?.items.find(item => item.label === 'Жёлтый')?.onSelect?.()
		style[0].children?.items.find(item => item.label.startsWith('150'))?.onSelect?.()
		menu.select('Загрузить файл субтитров…')
		await vi.waitFor(() => expect(wrapper.find('.base-media-player__caption-line').text()).toBe('Hello'))
		const box = wrapper.get('.base-media-player__caption-box')
		expect(box.classes()).toContain('base-media-player__caption-box--color-yellow')
		expect(box.attributes('style')).toContain('--caption-scale: 1.5')
		expect(click).toHaveBeenCalledOnce()
		wrapper.unmount()
	})

	it('файл зрителя через поле выбора: .srt становится дорожкой, чужой файл — сообщение', async () => {
		const { root, captions, flash } = await setup({ tracks: undefined })
		const input = root.querySelector('input[type="file"]') as HTMLInputElement

		expect(input).toHaveAttribute('accept', '.srt,.vtt')
		expect(screen.getByRole('button', { name: 'Субтитры' })).not.toHaveClass('base-media-player__control--active')
		await chooseFiles(input, [new File([SRT_FILE], 'serial-01.srt')])
		await vi.waitFor(() => expect(captions()).toBe('Из файла зрителя'))
		expect(screen.getByRole('button', { name: 'Субтитры' })).toHaveClass('base-media-player__control--active')

		await chooseFiles(input, [new File(['x'], 'poster.png')])
		expect(flash()).toBe('Не удалось загрузить субтитры')
		await chooseFiles(input, [])
		expect(captions()).toBe('Из файла зрителя')
	})

	it('перетаскивание файла на плеер: подсказка, загрузка, чужие перетаскивания не принимаются', async () => {
		const { root, video, captions, flash } = await setup({ tracks: [] })

		expect(await dispatch(root, dragEvent('dragover', { types: ['Files'] }))).toBe(false)
		expect(root).toHaveClass('base-media-player--drop-target')
		expect(screen.getByText('Отпустите файл, чтобы добавить субтитры')).toBeInTheDocument()
		await dispatch(root, dragEvent('dragleave', { relatedTarget: video }))
		expect(root).toHaveClass('base-media-player--drop-target')
		await dispatch(root, dragEvent('dragleave'))
		expect(root).not.toHaveClass('base-media-player--drop-target')

		expect(await dispatch(root, dragEvent('dragover', { types: ['text/plain'] }))).toBe(true)
		expect(await dispatch(root, dragEvent('dragover'))).toBe(true)
		expect(await dispatch(root, dragEvent('drop', { types: ['text/plain'] }))).toBe(true)
		await dispatch(root, dragEvent('drop', { types: ['Files'], files: [new File(['x'], 'movie.mkv')] }))
		expect(flash()).toBe('Не удалось загрузить субтитры')
		expect(await dispatch(root, dragEvent('drop', { types: ['Files'], files: [new File([SRT_FILE], 'my.SRT')] }))).toBe(false)
		await vi.waitFor(() => expect(captions()).toBe('Из файла зрителя'))
		expect(root).not.toHaveClass('base-media-player--drop-target')
	})

	it('без загрузки файлов: нет поля выбора, перетаскивание не принимается', async () => {
		const { root } = await setup({ hasCaptionUpload: false })

		expect(root.querySelector('input[type="file"]')).toBeNull()
		expect(await dispatch(root, dragEvent('dragover', { types: ['Files'] }))).toBe(true)
		expect(await dispatch(root, dragEvent('drop', { types: ['Files'], files: [new File([SRT_FILE], 'a.srt')] }))).toBe(true)
	})

	it('ошибка загрузки дорожки: сообщение, субтитры выключены', async () => {
		const { flash } = await setup({ tracks: [{ src: '/subs/missing.vtt', label: 'Нет файла', isDefault: true }] })

		await vi.waitFor(() => expect(flash()).toBe('Не удалось загрузить субтитры'))
		expect(screen.getByRole('button', { name: 'Субтитры' })).not.toHaveClass('base-media-player__control--active')
	})

	it('v-model:text-track: null выключает, адрес включает дорожку', async () => {
		const { captions, rerender } = await setup({ textTrack: null })

		expect(captions()).toBe('')
		await rerender({ textTrack: '/subs/en.srt' })
		await vi.waitFor(() => expect(captions()).toBe('Hello'))
		await rerender({ textTrack: null })
		expect(captions()).toBe('')
	})

	it('блок субтитров перетаскивается мышью и остаётся на месте до отпускания', async () => {
		const { root, fake, captions } = await setup()
		await vi.waitFor(() => expect(captions()).toBe('Привет, мир'))
		const area = root.querySelector('.base-media-player__captions') as HTMLElement
		const box = root.querySelector('.base-media-player__caption-box') as HTMLElement
		area.getBoundingClientRect = () => ({ width: 1000, height: 500 }) as DOMRect
		box.getBoundingClientRect = () => ({ width: 200, height: 50 }) as DOMRect

		expect(box).toHaveAttribute('title', 'Перетащите, чтобы переместить субтитры')
		await fireEvent.pointerDown(box, { button: 0, clientX: 500, clientY: 430 })
		await fireEvent.pointerMove(box, { clientX: 400, clientY: 230 })
		expect(box.style.left).toBe('40%')
		expect(box.style.top).toBe('46%')
		fake.update({ currentTime: 20 }, 'seeked')
		await nextTick()
		expect(root.querySelector('.base-media-player__caption-box')).toBe(box)
		await fireEvent.pointerUp(box)
		await fireEvent.pointerCancel(box)
		await fireEvent.lostPointerCapture(box)
		expect(root.querySelector('.base-media-player__caption-box')).toBeNull()
		expect(JSON.parse(localStorage.getItem('rise-media:captions') as string).position).toEqual({ x: 40, y: 46 })
	})
})
