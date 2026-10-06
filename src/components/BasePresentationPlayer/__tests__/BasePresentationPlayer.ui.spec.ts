import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { UI_PRESENTATION } from '../model/player/messages'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContentWrapper } from './utils/presentationContent.test-utils'
import { PRESENTATION_PLAYER_PARTS } from '../types/BasePresentationPlayer.types'
import { advance, contentSlides, mountContent } from './utils/presentationContent.test-utils'

const UI = Object.fromEntries(PRESENTATION_PLAYER_PARTS.map(part => [part, `u-${part}`]))

const NOTES_SLIDES = contentSlides(3, { notes: 'Текст стенограммы', minDuration: 5 })

const partOf = (wrapper: ContentWrapper, part: string) =>
	wrapper.get(part === 'root' ? '.base-presentation-player' : `.base-presentation-player__${part}`)

function expectParts(wrapper: ContentWrapper, parts: readonly string[]): void {
	for (const part of parts) {
		const block = part === 'root' ? 'base-presentation-player' : `base-presentation-player__${part}`
		expect(partOf(wrapper, part).classes()).toEqual(expect.arrayContaining([block, `u-${part}`]))
	}
}

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

describe('BasePresentationPlayer: проп ui', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('кадр, слайд, «Далее» с кольцом замка, стенограмма — классы ui добавляются к БЭМ-классам кита', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES, navigation: 'linear', ui: UI, customClass: { stage: 'own' } })
		expect(partOf(wrapper, 'root').classes()).toContain('base-media-player')
		expect(partOf(wrapper, 'stage').classes()).toContain('own')
		await wrapper.get('.base-presentation-player__notes-button').trigger('click')
		await nextTick()
		expectParts(wrapper, ['root', 'stage', 'slide', 'next', 'ring', 'panel', 'notes', 'notes-title', 'notes-text'])
		expect(partOf(wrapper, 'panel').classes()).toContain('base-media-player__episodes')
		expect(partOf(wrapper, 'next').classes()).toContain('base-presentation-player__next--locked')
	})

	it('отметка карточки и экран «Пройдено» — тоже с классами ui', async () => {
		const wrapper = await mountContent({ slides: contentSlides(2, { duration: 1 }), ui: UI })
		wrapper.vm.play()
		await advance(1200)
		await wrapper.get('.base-presentation-player__slides-button').trigger('click')
		await nextTick()
		expectParts(wrapper, ['card-mark'])
		expect(partOf(wrapper, 'card-mark').classes()).toContain('base-presentation-player__card-mark--done')
		await advance(1200)
		expectParts(wrapper, ['done', 'done-icon', 'done-title', 'done-text'])
		expect(partOf(wrapper, 'done').text()).toContain(UI_PRESENTATION.REPLAY)
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', async () => {
		const plugin = createUiKitPlugin({ defaults: { BasePresentationPlayer: { ui: { stage: 'app', root: 'app-root' } } } })
		const wrapper = await mountContent({ slides: contentSlides(2), ui: { stage: 'own' } }, { global: { plugins: [plugin] } })
		expect(partOf(wrapper, 'root').classes()).toContain('app-root')
		expect(partOf(wrapper, 'stage').attributes('class')).toBe('base-presentation-player__stage app own')
		expect(partOf(wrapper, 'slide').attributes('class')).toBe('base-presentation-player__slide')
	})
})

describe('BasePresentationPlayer: движение', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('направление смены слайда: вперёд — без модификатора, назад — __stage--backward', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3) })
		const stage = () => partOf(wrapper, 'stage')
		expect(stage().classes()).not.toContain('base-presentation-player__stage--backward')
		wrapper.vm.goTo(2)
		await nextTick()
		expect(stage().classes()).not.toContain('base-presentation-player__stage--backward')
		wrapper.vm.previous()
		await nextTick()
		expect(stage().classes()).toContain('base-presentation-player__stage--backward')
		wrapper.vm.next()
		await nextTick()
		expect(stage().classes()).not.toContain('base-presentation-player__stage--backward')
	})

	async function closedPanelAfter(ms: number): Promise<boolean> {
		const wrapper = await mountContent({ slides: contentSlides(2) }, { global: { stubs: { transition: false } } })
		await wrapper.get('.base-presentation-player__slides-button').trigger('click')
		await nextTick()
		await wrapper.get('.base-presentation-player__slides-button').trigger('click')
		await new Promise(resolve => setTimeout(resolve, ms))
		return !wrapper.find('.base-presentation-player__panel').exists()
	}

	it('боковая панель: длительность перехода — из токенов, уходящая панель держится до конца', async () => {
		stubReducedMotion(false)
		expect(await closedPanelAfter(60)).toBe(false)
	})

	it.each([
		['системное «уменьшить движение»', () => stubReducedMotion(true)],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
	])('%s — панель закрывается сразу', async (_, setup) => {
		stubReducedMotion(false)
		setup()
		expect(await closedPanelAfter(60)).toBe(true)
	})
})

describe('BasePresentationPlayer: прокрутка стенограммы', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('длинная стенограмма доступна с клавиатуры (tabindex 0), короткая — только программный фокус', async () => {
		const wrapper = await mountContent({ slides: NOTES_SLIDES })
		await wrapper.get('.base-presentation-player__notes-button').trigger('click')
		await nextTick()
		await nextTick()
		expect(partOf(wrapper, 'notes').attributes('tabindex')).toBe('-1')
		wrapper.unmount()

		vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400)
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100)
		const long = await mountContent({ slides: NOTES_SLIDES })
		await long.get('.base-presentation-player__notes-button').trigger('click')
		await nextTick()
		await nextTick()
		expect(partOf(long, 'notes').attributes('tabindex')).toBe('0')
	})
})
