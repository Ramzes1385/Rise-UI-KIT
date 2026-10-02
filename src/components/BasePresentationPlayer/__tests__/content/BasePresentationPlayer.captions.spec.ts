import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeMedia } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'
import { advance, captionText, contentSlides, mountContent, press, stubCaptionsFetch } from '../utils/presentationContent.test-utils'

const VTT = 'WEBVTT\n\n00:00.000 --> 00:02.000\nПривет, <i>мир</i>\n\n00:02.000 --> 00:04.000\nВторая реплика\n'
const SRT = '1\n00:00:00,000 --> 00:00:03,000\nОбщая дорожка\n\n2\n00:00:05,000 --> 00:00:08,000\nВторой слайд дорожки\n'

const captionsButton = (wrapper: Awaited<ReturnType<typeof mountContent>>) => wrapper.find('.base-presentation-player__captions-button')

describe('BasePresentationPlayer — субтитры озвучки', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('субтитры слайда идут по времени слайда, с курсивом; загрузка — same-origin', async () => {
		const fetchMock = stubCaptionsFetch({ '/s1.vtt': VTT })
		const wrapper = await mountContent({ slides: contentSlides(2, { captions: '/s1.vtt' }) })
		wrapper.vm.play()
		await advance(500)
		expect(fetchMock).toHaveBeenCalledWith('/s1.vtt', { credentials: 'same-origin' })
		expect(captionText(wrapper)).toBe('Привет, мир')
		expect(wrapper.get('.base-media-player__caption--italic').text()).toBe('мир')
		await advance(2000)
		expect(captionText(wrapper)).toBe('Вторая реплика')
		await advance(2500)
		expect(wrapper.find('.base-media-player__captions').exists()).toBe(false)
	})

	it('кнопка «Субтитры» и клавиша C переключают вывод и эмитят update:isCaptionsOn', async () => {
		stubCaptionsFetch({ '/s1.vtt': VTT })
		const wrapper = await mountContent({ slides: contentSlides(2, { captions: '/s1.vtt' }) })
		wrapper.vm.play()
		await advance(500)
		const button = captionsButton(wrapper)
		expect(button.attributes('aria-label')).toBe('Субтитры')
		expect(button.attributes('aria-pressed')).toBe('true')
		await button.trigger('click')
		expect(button.attributes('aria-pressed')).toBe('false')
		expect(wrapper.find('.base-media-player__captions').exists()).toBe(false)
		await press(wrapper, 'KeyC')
		await advance(0)
		expect(button.attributes('aria-pressed')).toBe('true')
		expect(captionText(wrapper)).toBe('Привет, мир')
		expect(wrapper.emitted('update:isCaptionsOn')).toEqual([[false], [true]])
	})

	it('isCaptionsOn=false: файл не грузится до включения пропом снаружи', async () => {
		const fetchMock = stubCaptionsFetch({ '/s1.vtt': VTT })
		const wrapper = await mountContent({ slides: contentSlides(1, { captions: '/s1.vtt' }), isCaptionsOn: false })
		wrapper.vm.play()
		await advance(500)
		expect(fetchMock).not.toHaveBeenCalled()
		expect(captionsButton(wrapper).attributes('aria-pressed')).toBe('false')
		await wrapper.setProps({ isCaptionsOn: true })
		await advance(0)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(captionText(wrapper)).toBe('Привет, мир')
		await wrapper.setProps({ isCaptionsOn: undefined })
		expect(captionsButton(wrapper).attributes('aria-pressed')).toBe('true')
	})

	it('crossorigin="use-credentials" — fetch с credentials: include; файл кэшируется по адресу', async () => {
		const fetchMock = stubCaptionsFetch({ '/s1.vtt': VTT })
		const wrapper = await mountContent({
			slides: contentSlides(2, { captions: '/s1.vtt' }),
			crossorigin: 'use-credentials',
		})
		await advance(0)
		wrapper.vm.goTo(1)
		await advance(0)
		wrapper.vm.goTo(0)
		await advance(0)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(fetchMock).toHaveBeenCalledWith('/s1.vtt', { credentials: 'include' })
	})

	it('ошибка загрузки или сети — субтитров нет, без сообщения, кнопка остаётся', async () => {
		const fetchMock = stubCaptionsFetch({})
		const wrapper = await mountContent({ slides: [...contentSlides(1, { captions: '/missing.vtt' }), ...contentSlides(1)] })
		wrapper.vm.play()
		await advance(500)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(wrapper.find('.base-media-player__captions').exists()).toBe(false)
		expect(captionsButton(wrapper).exists()).toBe(true)
		fetchMock.mockRejectedValueOnce(new TypeError('network'))
		await wrapper.setProps({ slides: contentSlides(1, { captions: '/offline.vtt' }) })
		await advance(0)
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(wrapper.find('.base-media-player__captions').exists()).toBe(false)
	})

	it('небезопасный адрес отбрасывается: нет кнопки, нет загрузки, клавиша C ничего не делает', async () => {
		const fetchMock = stubCaptionsFetch({})
		const wrapper = await mountContent({ slides: contentSlides(2, { captions: 'javascript:alert(1)' }) })
		await press(wrapper, 'KeyC')
		await advance(0)
		expect(captionsButton(wrapper).exists()).toBe(false)
		expect(fetchMock).not.toHaveBeenCalled()
		expect(wrapper.emitted('update:isCaptionsOn')).toBeUndefined()
	})

	it('общая дорожка: проп captions, время от начала дорожки (SRT), субтитры слайдов не используются', async () => {
		const fetchMock = stubCaptionsFetch({ '/track.srt': SRT, '/s1.vtt': VTT })
		const wrapper = await mountContent({
			slides: contentSlides(2, { duration: 5, captions: '/s1.vtt' }),
			audio: '/track.mp3',
			captions: '/track.srt',
		})
		const audio = fakeMedia(wrapper.get('audio').element as HTMLAudioElement, { duration: 10 })
		audio.emit('loadedmetadata')
		await advance(0)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(fetchMock).toHaveBeenCalledWith('/track.srt', { credentials: 'same-origin' })
		audio.update({ currentTime: 1 }, 'timeupdate')
		await advance(20)
		expect(captionText(wrapper)).toBe('Общая дорожка')
		audio.update({ currentTime: 6 }, 'timeupdate')
		await advance(20)
		expect(captionText(wrapper)).toBe('Второй слайд дорожки')
	})

	it('без субтитров — кнопки нет', async () => {
		stubCaptionsFetch({})
		const wrapper = await mountContent({ slides: contentSlides(2), audio: '/track.mp3' })
		expect(captionsButton(wrapper).exists()).toBe(false)
	})
})
