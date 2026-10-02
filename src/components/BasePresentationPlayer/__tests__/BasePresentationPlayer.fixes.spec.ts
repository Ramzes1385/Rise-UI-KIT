import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { advance, contentSlides, mountContent } from './utils/presentationContent.test-utils'

const KEY = 'rise-presentation:course'

describe('BasePresentationPlayer — исправления ff7ced68', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		localStorage.clear()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('linear: после авто-перехода следующий слайд не «пройден», пока не кончилось его время', async () => {
		const wrapper = await mountContent({ slides: contentSlides(3, { duration: 2 }), navigation: 'linear' })
		wrapper.vm.play()
		await advance(2100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.emitted('slide-complete')?.map(([event]) => (event as { id: string }).id)).toEqual(['s1'])
		const next = wrapper.get('button[aria-label="Следующий слайд"]')
		expect(next.attributes('aria-disabled')).toBe('true')
		await next.trigger('click')
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		await advance(2100)
		expect(wrapper.emitted('slide-complete')?.map(([event]) => (event as { id: string }).id)).toEqual(['s1', 's2'])
	})

	it('storageKey: переход, убравший плашку «Продолжить», сразу сохраняет новое место', async () => {
		localStorage.setItem(KEY, JSON.stringify({ index: 2, completed: [] }))
		const wrapper = await mountContent({ slides: contentSlides(3), storageKey: 'course' })
		expect(wrapper.find('.base-media-player__resume').exists()).toBe(true)
		await wrapper.get('button[aria-label="Следующий слайд"]').trigger('click')
		await nextTick()
		expect(wrapper.find('.base-media-player__resume').exists()).toBe(false)
		expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({ index: 1, completed: [] })
	})

	it('клик по кадру запускает и ставит на паузу; клик по кнопке в слоте — нет', async () => {
		const wrapper = await mountContent(
			{ slides: contentSlides(2) },
			{ slots: { slide: '<template #slide><button type="button" class="inside">Кнопка</button></template>' } },
		)
		await wrapper.get('.inside').trigger('click')
		expect(wrapper.emitted('play')).toBeUndefined()
		await wrapper.get('.base-presentation-player__stage').trigger('click')
		expect(wrapper.emitted('play')).toHaveLength(1)
		await wrapper.get('.base-presentation-player__stage').trigger('click')
		expect(wrapper.emitted('pause')).toHaveLength(1)
	})
})
