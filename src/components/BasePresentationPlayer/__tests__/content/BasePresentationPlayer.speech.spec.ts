import { nextTick } from 'vue'
import { UI_PRESENTATION } from '../../model/player/messages'
import { UI_PLAYER } from '@components/BaseMediaPlayer/model/messages'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PresentationSlide } from '../../types/BasePresentationPlayer.types'
import { advance, mountContent, press, removeSpeech, statusText, stubSpeech } from '../utils/presentationContent.test-utils'

const RU = { name: 'Милена', voiceURI: 'ru-milena', lang: 'ru-RU' }
const EN = { name: 'Samantha', voiceURI: 'en-samantha', lang: 'en-US' }
const DE = { name: 'Anna', voiceURI: 'de-anna', lang: 'de-DE' }

const speechSlides = (extra: Partial<PresentationSlide> = {}): PresentationSlide[] => [
	{ id: 'a', title: 'Первый', image: '/a.png', speech: 'Текст первого слайда', ...extra },
	{ id: 'b', title: 'Второй', image: '/b.png', speech: 'Текст второго слайда', ...extra },
	{ id: 'c', title: 'Третий', image: '/c.png', duration: 5 },
]

describe('BasePresentationPlayer — синтез речи', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		removeSpeech()
	})

	it('голос по языку кита; текст, скорость и громкость; конец фразы — переход и slide-complete', async () => {
		const speech = stubSpeech([EN, RU])
		const wrapper = await mountContent({ slides: speechSlides() })
		expect(speech.engine.speak).not.toHaveBeenCalled()
		wrapper.vm.play()
		await advance(0)
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
		const utterance = speech.last()!
		expect(utterance).toMatchObject({ text: 'Текст первого слайда', lang: 'ru-RU', rate: 1, volume: 1 })
		expect(utterance.voice?.name).toBe(RU.name)
		utterance.onend?.()
		await advance(0)
		expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'a', index: 0 })
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(speech.engine.cancel).toHaveBeenCalled()
		expect(speech.last()?.text).toBe('Текст второго слайда')
	})

	it('speechVoice выбирает голос по name и по voiceURI', async () => {
		const speech = stubSpeech([RU, EN])
		const wrapper = await mountContent({ slides: speechSlides(), speechVoice: 'Samantha' })
		wrapper.vm.play()
		await advance(0)
		expect(speech.last()?.voice?.name).toBe(EN.name)
		expect(speech.last()?.lang).toBe('en-US')
		await wrapper.setProps({ speechVoice: 'ru-milena' })
		wrapper.vm.goTo(1)
		await advance(0)
		expect(speech.last()?.voice?.name).toBe(RU.name)
	})

	it('нет голоса языка и speechVoice не найден — без голоса, lang = язык кита', async () => {
		const speech = stubSpeech([DE])
		const wrapper = await mountContent({ slides: speechSlides(), speechVoice: 'Нет такого' })
		wrapper.vm.play()
		await advance(0)
		expect(speech.last()?.voice).toBeNull()
		expect(speech.last()?.lang).toBe('ru')
	})

	it('пауза показа — pause(), продолжение — resume() без новой фразы', async () => {
		const speech = stubSpeech([RU])
		const wrapper = await mountContent({ slides: speechSlides() })
		wrapper.vm.play()
		await advance(0)
		speech.engine.pause.mockClear()
		wrapper.vm.pause()
		await advance(0)
		expect(speech.engine.pause).toHaveBeenCalledTimes(1)
		wrapper.vm.play()
		await advance(0)
		expect(speech.engine.resume).toHaveBeenCalledTimes(1)
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
	})

	it('громкость и выключенный звук — со следующего слайда', async () => {
		const speech = stubSpeech([RU])
		const wrapper = await mountContent({ slides: speechSlides() })
		await press(wrapper, 'ArrowDown')
		wrapper.vm.play()
		await advance(0)
		expect(speech.last()?.volume).toBeCloseTo(0.95)
		await press(wrapper, 'KeyM')
		await nextTick()
		expect(wrapper.find(`button[aria-label="${UI_PLAYER.UNMUTE}"]`).exists()).toBe(true)
		wrapper.vm.goTo(1)
		await advance(0)
		expect(speech.last()?.volume).toBe(0)
	})

	it('смена слайда — cancel(); конец старой фразы потом ничего не меняет', async () => {
		const speech = stubSpeech([RU])
		const wrapper = await mountContent({ slides: speechSlides() })
		wrapper.vm.play()
		await advance(0)
		const first = speech.last()!
		speech.engine.cancel.mockClear()
		wrapper.vm.goTo(2)
		await advance(0)
		expect(speech.engine.cancel).toHaveBeenCalled()
		first.onend?.()
		await advance(0)
		expect(wrapper.emitted('update:slide')).toEqual([[2]])
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
	})

	it('голоса пришли позже — по voiceschanged; размонтирование снимает подписку и отменяет речь', async () => {
		const speech = stubSpeech([])
		const wrapper = await mountContent({ slides: speechSlides() })
		wrapper.vm.play()
		await advance(500)
		expect(speech.engine.speak).not.toHaveBeenCalled()
		speech.setVoices([RU])
		await advance(0)
		expect(speech.last()?.voice?.name).toBe(RU.name)
		speech.engine.cancel.mockClear()
		wrapper.unmount()
		expect(speech.engine.cancel).toHaveBeenCalled()
		expect(speech.engine.removeEventListener).toHaveBeenCalledWith('voiceschanged', expect.any(Function))
	})

	it('linear: пока ждём голоса, «Следующий слайд» закрыта с текстом «после озвучки»', async () => {
		stubSpeech([])
		const wrapper = await mountContent({ slides: speechSlides({ duration: 3 }), navigation: 'linear' })
		wrapper.vm.play()
		await advance(100)
		await wrapper.get('button[aria-label="Следующий слайд"]').trigger('click')
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(statusText(wrapper)).toBe(UI_PRESENTATION.LOCKED_AUDIO)
	})

	it('голосов нет 1,5 с — слайд идёт по duration', async () => {
		const speech = stubSpeech([])
		const wrapper = await mountContent({ slides: speechSlides({ duration: 3 }) })
		wrapper.vm.play()
		await advance(1600)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		await advance(3100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(speech.engine.speak).not.toHaveBeenCalled()
	})

	it('голосов нет 1,5 с и нет duration — сразу конец слайда', async () => {
		stubSpeech([])
		const wrapper = await mountContent({ slides: speechSlides() })
		wrapper.vm.play()
		await advance(1600)
		expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'a' })
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('нет window.speechSynthesis — сразу по duration', async () => {
		removeSpeech()
		const wrapper = await mountContent({ slides: speechSlides({ duration: 2 }) })
		wrapper.vm.play()
		await advance(2100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('у слайда с audio речь не используется', async () => {
		const speech = stubSpeech([RU])
		const wrapper = await mountContent({ slides: speechSlides({ audio: '/a.webm' }) })
		wrapper.vm.play()
		await advance(0)
		expect(speech.engine.speak).not.toHaveBeenCalled()
	})
})
