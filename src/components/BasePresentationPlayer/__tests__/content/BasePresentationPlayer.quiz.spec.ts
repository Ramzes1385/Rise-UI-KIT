import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_PRESENTATION, formatMessage } from '../../model/player/messages'
import type { ContentWrapper } from '../utils/presentationContent.test-utils'
import type { PresentationSlide } from '../../types/BasePresentationPlayer.types'
import { advance, mountContent, statusText } from '../utils/presentationContent.test-utils'

const SLOT = {
	slide: `<template #slide="{ slide, complete, isCompleted }">
		<div class="quiz">
			<p>{{ slide.title }}</p>
			<button type="button" class="quiz-answer" @click="complete">Ответ</button>
			<span class="quiz-state">{{ isCompleted ? 'да' : 'нет' }}</span>
		</div>
	</template>`,
}

const quizSlides = (extra: Partial<PresentationSlide> = {}): PresentationSlide[] => [
	{ id: 'q', title: 'Вопрос', image: '/q.png', duration: 2, isInteractive: true, ...extra },
	{ id: 'b', title: 'Дальше', image: '/b.png', duration: 5 },
]

const nextButton = (wrapper: ContentWrapper) => wrapper.get('button[aria-label="Следующий слайд"]')
const answer = async (wrapper: ContentWrapper): Promise<void> => {
	await wrapper.get('.quiz-answer').trigger('click')
	await nextTick()
}

describe('BasePresentationPlayer — слайд-вопрос (isInteractive)', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it.each(['linear', 'strict'] as const)(
		'%s: до complete() нет slide-complete, после времени — пауза и подсказка «Ответьте на вопрос»; после ответа — без авто-перехода',
		async navigation => {
			const wrapper = await mountContent({ slides: quizSlides(), navigation }, { slots: SLOT })
			wrapper.vm.play()
			await advance(500)
			await nextButton(wrapper).trigger('click')
			expect(statusText(wrapper)).toBe(formatMessage(UI_PRESENTATION.LOCKED, { n: 2 }))
			await advance(2000)
			expect(wrapper.emitted('pause')).toHaveLength(1)
			expect(wrapper.emitted('slide-complete')).toBeUndefined()
			expect(nextButton(wrapper).attributes('aria-disabled')).toBe('true')
			await nextButton(wrapper).trigger('click')
			expect(wrapper.emitted('update:slide')).toBeUndefined()
			expect(statusText(wrapper)).toBe(UI_PRESENTATION.LOCKED_QUIZ)
			expect(wrapper.get('.quiz-state').text()).toBe('нет')
			await answer(wrapper)
			expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'q', index: 0 })
			expect(wrapper.get('.quiz-state').text()).toBe('да')
			await advance(3000)
			expect(wrapper.emitted('update:slide')).toBeUndefined()
			expect(nextButton(wrapper).attributes('aria-disabled')).toBeUndefined()
			await nextButton(wrapper).trigger('click')
			expect(wrapper.emitted('update:slide')).toEqual([[1]])
		},
	)

	it('free: конец времени на неотвеченном вопросе — пауза, без перехода', async () => {
		const wrapper = await mountContent({ slides: quizSlides() }, { slots: SLOT })
		wrapper.vm.play()
		await advance(2100)
		expect(wrapper.emitted('pause')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		await answer(wrapper)
		expect(wrapper.emitted('slide-complete')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
	})

	it('ответ раньше конца времени — пройден по концу времени, как обычный слайд', async () => {
		const wrapper = await mountContent({ slides: quizSlides(), navigation: 'linear' }, { slots: SLOT })
		wrapper.vm.play()
		await advance(500)
		await answer(wrapper)
		expect(wrapper.emitted('slide-complete')).toBeUndefined()
		await advance(1600)
		expect(wrapper.emitted('slide-complete')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('ответ на вопросе не переносится на следующий вопрос', async () => {
		const slides = [quizSlides()[0], { ...quizSlides()[0], id: 'q2', title: 'Вопрос 2' }]
		const wrapper = await mountContent({ slides }, { slots: SLOT })
		wrapper.vm.play()
		await advance(500)
		await answer(wrapper)
		await advance(1600)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		await advance(2100)
		expect(wrapper.emitted('slide-complete')).toHaveLength(1)
		expect(wrapper.get('.quiz-state').text()).toBe('нет')
	})

	it('complete() у обычного слайда ничего не делает', async () => {
		const wrapper = await mountContent({ slides: quizSlides({ isInteractive: false }) }, { slots: SLOT })
		wrapper.vm.play()
		await advance(500)
		await answer(wrapper)
		expect(wrapper.emitted('slide-complete')).toBeUndefined()
		await advance(1600)
		expect(wrapper.emitted('slide-complete')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})
})
