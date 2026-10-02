import { nextTick } from 'vue'
import { UI_ARIA } from '@components/BaseMediaPlayer/model/messages'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_PRESENTATION, formatMessage } from '../../model/player/messages'
import type { ContentWrapper } from '../utils/presentationContent.test-utils'
import { advance, contentSlides, mountContent, statusText } from '../utils/presentationContent.test-utils'

const slidesButton = (wrapper: ContentWrapper) => wrapper.get('.base-presentation-player__slides-button')
const notesButton = (wrapper: ContentWrapper) => wrapper.find('.base-presentation-player__notes-button')
const panel = (wrapper: ContentWrapper) => wrapper.find('section.base-presentation-player__panel')
const cards = (wrapper: ContentWrapper) => wrapper.findAll('.base-media-player__episode-card')
const viewButton = (wrapper: ContentWrapper, name: string) =>
	wrapper.findAll('.base-media-player__episodes-view').find(button => button.text() === name)!

async function openSlides(wrapper: ContentWrapper): Promise<void> {
	await slidesButton(wrapper).trigger('click')
	await nextTick()
}

const NOTES_SLIDES = [
	{ id: 'a', title: 'Введение', image: '/a.png', duration: 5, notes: 'Первый абзац.\n\n  Второй абзац.  ' },
	{ id: 'b', title: 'Без заметок', image: '/b.png', duration: 5 },
	{ id: 'c', title: 'Итог', image: '/c.png', duration: 5, notes: 'Итоговый текст' },
]

describe('BasePresentationPlayer — панель «Список слайдов» и «Стенограмма»', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('кнопка «Список слайдов» есть всегда: счётчик, aria-expanded; без notes нет «Стенограммы»', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3) })
		const button = slidesButton(wrapper)
		expect(button.attributes('aria-label')).toBe(UI_PRESENTATION.SLIDE_LIST)
		expect(button.attributes('aria-expanded')).toBe('false')
		expect(button.text()).toContain('3')
		expect(notesButton(wrapper).exists()).toBe(false)
		await openSlides(wrapper)
		expect(button.attributes('aria-expanded')).toBe('true')
		expect(panel(wrapper).attributes('aria-label')).toBe(UI_PRESENTATION.SLIDE_LIST)
		expect(wrapper.find('.base-media-player__episodes-title').text()).toBe(UI_PRESENTATION.SLIDE_LIST)
		expect(wrapper.find('.base-media-player__episodes-views').exists()).toBe(false)
	})

	it('открытие — фокус на текущей карточке; карточка: номер, миниатюра, длительность, название', async () => {
		const slides = [...contentSlides(2, { duration: 65 }), { id: 'x', title: 'Без времени', image: 'javascript:void(0)' }]
		const wrapper = await mountContent({ slides, slide: 1 })
		await openSlides(wrapper)
		const [first, second, third] = cards(wrapper)
		expect(second.attributes('aria-current')).toBe('true')
		expect(first.attributes('aria-current')).toBeUndefined()
		expect(document.activeElement).toBe(second.element)
		expect(first.get('.base-media-player__episode-number').text()).toBe('1')
		expect(first.get('img').attributes('src')).toBe('/s1.png')
		expect(first.get('.base-media-player__episode-duration').text()).toBe('1:05')
		expect(first.get('.base-media-player__episode-name').text()).toBe('Слайд-1')
		expect(third.find('img').exists()).toBe(false)
		expect(third.find('.base-media-player__episode-duration').exists()).toBe(false)
	})

	it('пройденный слайд — галочка и скрытый текст «Пройден»', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3, { duration: 1 }) })
		wrapper.vm.play()
		await advance(1200)
		await openSlides(wrapper)
		const [first, second] = cards(wrapper)
		expect(first.get('.base-presentation-player__card-mark--done').text()).toBe(UI_PRESENTATION.SLIDE_DONE)
		expect(second.find('.base-presentation-player__card-mark').exists()).toBe(false)
	})

	it.each(['linear', 'strict'] as const)(
		'%s: дальние слайды с замком и aria-disabled, нажатие не меняет слайд, подсказка в role="status"',
		async navigation => {
			const wrapper = await mountContent({ slides: contentSlides(3, { duration: 5 }), navigation })
			await openSlides(wrapper)
			const [first, second, third] = cards(wrapper)
			expect(first.attributes('aria-disabled')).toBeUndefined()
			expect(second.attributes('aria-disabled')).toBe('true')
			expect(third.get('.base-presentation-player__card-mark').text()).toBe(UI_PRESENTATION.SLIDE_LOCKED)
			expect(third.find('svg.base-presentation-player__lock').exists()).toBe(true)
			await third.trigger('click')
			expect(wrapper.emitted('update:slide')).toBeUndefined()
			expect(panel(wrapper).exists()).toBe(true)
			expect(statusText(wrapper)).toBe(formatMessage(UI_PRESENTATION.LOCKED, { n: 5 }))
		},
	)

	it('выбор доступного слайда закрывает панель, фокус на «Список слайдов», update:slide', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3) })
		await openSlides(wrapper)
		await cards(wrapper)[2].trigger('click')
		await nextTick()
		expect(wrapper.emitted('update:slide')).toEqual([[2]])
		expect(panel(wrapper).exists()).toBe(false)
		expect(document.activeElement).toBe(slidesButton(wrapper).element)
	})

	it('Escape внутри панели закрывает её и возвращает фокус; другие клавиши — нет', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3) })
		await openSlides(wrapper)
		await panel(wrapper).trigger('keydown', { key: 'Enter' })
		expect(panel(wrapper).exists()).toBe(true)
		await panel(wrapper).trigger('keydown', { key: 'Escape' })
		expect(panel(wrapper).exists()).toBe(false)
		expect(document.activeElement).toBe(slidesButton(wrapper).element)
	})

	it('кнопка «Закрыть» и повторное нажатие «Список слайдов» закрывают панель', async () => {
		const wrapper = await mountContent({ slides: contentSlides(2) })
		await openSlides(wrapper)
		await panel(wrapper).get(`button[aria-label="${UI_ARIA.CLOSE}"]`).trigger('click')
		expect(panel(wrapper).exists()).toBe(false)
		await openSlides(wrapper)
		await slidesButton(wrapper).trigger('click')
		expect(panel(wrapper).exists()).toBe(false)
		expect(slidesButton(wrapper).attributes('aria-expanded')).toBe('false')
	})

	it('клик снаружи закрывает панель; внутри и по кнопкам панели — нет', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES })
		await openSlides(wrapper)
		cards(wrapper)[0].element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
		notesButton(wrapper).element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
		await nextTick()
		expect(panel(wrapper).exists()).toBe(true)
		expect(document.activeElement).toBe(cards(wrapper)[0].element)
		document.dispatchEvent(new Event('pointerdown'))
		await nextTick()
		expect(panel(wrapper).exists()).toBe(false)
		expect(document.activeElement).toBe(slidesButton(wrapper).element)
	})

	it('после закрытия клик снаружи больше не слушается; фокус вне панели не переносится', async () => {
		const wrapper = await mountContent({ slides: contentSlides(2) })
		const removeSpy = vi.spyOn(document, 'removeEventListener')
		await openSlides(wrapper)
		const stage = wrapper.get('.base-presentation-player__stage').element as HTMLElement
		stage.tabIndex = 0
		stage.focus()
		stage.dispatchEvent(new Event('pointerdown', { bubbles: true }))
		await nextTick()
		expect(panel(wrapper).exists()).toBe(false)
		expect(document.activeElement).toBe(stage)
		expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)
	})

	it('двойное нажатие до перерисовки не ломает фокус', async () => {
		const wrapper = await mountContent({ slides: contentSlides(2) })
		const button = slidesButton(wrapper).element as HTMLButtonElement
		button.click()
		button.click()
		await nextTick()
		await nextTick()
		expect(panel(wrapper).exists()).toBe(false)
	})

	it('«Стенограмма»: фокус на тексте, «N. Название» и абзацы, переключатель видов', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES })
		const button = notesButton(wrapper)
		expect(button.attributes('aria-label')).toBe(UI_PRESENTATION.NOTES)
		await button.trigger('click')
		await nextTick()
		expect(button.attributes('aria-expanded')).toBe('true')
		expect(panel(wrapper).attributes('aria-label')).toBe(UI_PRESENTATION.NOTES)
		const notes = wrapper.get('.base-presentation-player__notes')
		expect(document.activeElement).toBe(notes.element)
		expect(notes.get('.base-presentation-player__notes-title').text()).toBe('1. Введение')
		expect(notes.findAll('.base-presentation-player__notes-text').map(text => text.text())).toEqual(['Первый абзац.', 'Второй абзац.'])
		expect(viewButton(wrapper, UI_PRESENTATION.NOTES).attributes('aria-pressed')).toBe('true')
		await viewButton(wrapper, UI_PRESENTATION.SLIDE_LIST).trigger('click')
		await nextTick()
		expect(panel(wrapper).attributes('aria-label')).toBe(UI_PRESENTATION.SLIDE_LIST)
		expect(viewButton(wrapper, UI_PRESENTATION.SLIDE_LIST).attributes('aria-pressed')).toBe('true')
		expect(document.activeElement).toBe(cards(wrapper)[0].element)
		await viewButton(wrapper, UI_PRESENTATION.NOTES).trigger('click')
		await panel(wrapper).trigger('keydown', { key: 'Escape' })
		expect(document.activeElement).toBe(notesButton(wrapper).element)
	})

	it('стенограмма меняется со слайдом; у слайда без notes — «нет стенограммы»', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES })
		await notesButton(wrapper).trigger('click')
		wrapper.vm.goTo(1)
		await nextTick()
		const notes = wrapper.get('.base-presentation-player__notes')
		expect(notes.get('.base-presentation-player__notes-title').text()).toBe('2. Без заметок')
		expect(notes.get('.base-presentation-player__notes-text').text()).toBe(UI_PRESENTATION.NOTES_EMPTY)
		wrapper.vm.goTo(2)
		await nextTick()
		expect(wrapper.get('.base-presentation-player__notes-text').text()).toBe('Итоговый текст')
	})

	it('«Стенограмма» открыта, слайды убрали — заголовка нет, панель не падает', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES })
		await notesButton(wrapper).trigger('click')
		expect(wrapper.find('.base-presentation-player__notes-title').exists()).toBe(true)
		await wrapper.setProps({ slides: [] })
		const notes = wrapper.get('.base-presentation-player__notes')
		expect(notes.find('.base-presentation-player__notes-title').exists()).toBe(false)
		expect(notes.get('.base-presentation-player__notes-text').text()).toBe(UI_PRESENTATION.NOTES_EMPTY)
	})

	it('notes из одних пробелов не считаются стенограммой; пустой список слайдов', async () => {
		const wrapper = await mountContent({ slides: contentSlides(2, { notes: '   ' }) })
		expect(notesButton(wrapper).exists()).toBe(false)
		await wrapper.setProps({ slides: [] })
		await openSlides(wrapper)
		expect(cards(wrapper)).toHaveLength(0)
	})
})
