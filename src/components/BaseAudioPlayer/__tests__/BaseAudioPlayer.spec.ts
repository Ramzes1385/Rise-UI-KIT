import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { fakeAudio } from './audio.test-utils'
import BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseAudioPlayerExpose } from '../types/BaseAudioPlayer.types'

const decodeWaveformPeaks = vi.hoisted(() => vi.fn(async (_src: string, _bars: number): Promise<number[] | null> => null))

vi.mock('@utils/media/mediaUtils', async original => ({ ...(await original<object>()), decodeWaveformPeaks }))

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseAudioPlayer, { props: { src: '/voice.webm', title: 'Голосовое', peaks: [0.5, 1], ...props } })
	const audio = result.container.querySelector('audio') as HTMLAudioElement
	return { ...result, audio, fake: fakeAudio(audio, { duration: 12 }) }
}

describe('BaseAudioPlayer', () => {
	afterEach(() => {
		decodeWaveformPeaks.mockReset()
		decodeWaveformPeaks.mockResolvedValue(null)
	})

	it('до загрузки — длительность из props; после метаданных — из файла; группа с названием', async () => {
		const { fake } = setup({ duration: 9 })
		const group = screen.getByRole('group', { name: 'Голосовое' })
		expect(group).toHaveTextContent('0:09')
		fake.emit('loadedmetadata')
		await nextTick()
		expect(group).toHaveTextContent('0:12')
		expect(screen.queryByText('Голосовое')).not.toBeInTheDocument()
	})

	it('пуск и пауза: подпись кнопки, события, время «позиция / длительность»', async () => {
		const { fake, emitted } = setup({ hasTitle: true })
		expect(screen.getByText('Голосовое')).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		expect(fake.play).toHaveBeenCalledOnce()
		fake.update({ currentTime: 3 }, 'timeupdate')
		fake.emit('durationchange')
		await nextTick()
		expect(screen.getByRole('group')).toHaveTextContent('0:03 / 0:12')
		await fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
		expect(fake.pause).toHaveBeenCalledOnce()
		fake.emit('ended')
		expect(Object.keys(emitted())).toEqual(expect.arrayContaining(['play', 'pause', 'ended', 'update:currentTime']))
		expect(emitted('update:currentTime')?.at(-1)).toEqual([3])
	})

	it('перемотка по волне и v-model позиции; близкое значение не перематывает', async () => {
		const { fake, rerender } = setup()
		fake.emit('durationchange')
		await nextTick()
		await fireEvent.keyDown(screen.getByRole('slider', { name: 'Перемотка' }), { key: 'End' })
		expect(fake.values.currentTime).toBe(12)
		await rerender({ currentTime: 4 })
		expect(fake.values.currentTime).toBe(4)
		await rerender({ currentTime: 4.2 })
		expect(fake.values.currentTime).toBe(4)
	})

	it('скорость по кругу; меньше двух скоростей — без кнопки', async () => {
		const { fake, rerender } = setup()
		await fireEvent.click(screen.getByRole('button', { name: 'Скорость 1×' }))
		expect(fake.values.playbackRate).toBe(1.5)
		await fireEvent.click(await screen.findByRole('button', { name: 'Скорость 1,5×' }))
		await fireEvent.click(await screen.findByRole('button', { name: 'Скорость 2×' }))
		expect(fake.values.playbackRate).toBe(1)
		await rerender({ playbackRates: [1] })
		expect(screen.queryByRole('button', { name: /Скорость/ })).not.toBeInTheDocument()
	})

	it('на странице играет один плеер; с isExclusive=false — не мешает другим', async () => {
		const first = setup()
		const second = setup({ title: 'Второе' })
		const third = setup({ title: 'Третье', isExclusive: false })
		const [firstButton, secondButton, thirdButton] = screen.getAllByRole('button', { name: 'Воспроизвести' })
		await fireEvent.click(firstButton)
		await fireEvent.click(secondButton)
		expect(second.fake.play).toHaveBeenCalledOnce()
		expect(first.fake.pause).toHaveBeenCalledOnce()
		await fireEvent.click(thirdButton)
		expect(second.fake.pause).not.toHaveBeenCalled()
		expect(third.fake.play).toHaveBeenCalledOnce()
		second.unmount()
		third.unmount()
		first.unmount()
	})

	it('ошибки: загрузка, отказ браузера и прочие; сообщение для скринридера', async () => {
		const { fake, emitted } = setup()
		fake.update({ error: { code: 2 } }, 'error')
		await nextTick()
		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось воспроизвести запись')
		fake.update({ error: { code: 9 } }, 'error')
		fake.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		fake.play.mockRejectedValueOnce(new Error('boom'))
		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		await nextTick()
		fake.update({ error: null }, 'error')
		expect(((emitted('error') ?? []) as Array<[{ code: string }]>).map(([error]) => error.code)).toEqual([
			'network',
			'unknown',
			'not-allowed',
			'unknown',
			'unknown',
		])
		fake.emit('play')
		await nextTick()
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})

	it('без peaks волна считается из файла; пока нет — ровные столбики; устаревший ответ не применяется', async () => {
		let resolveFirst: (peaks: number[]) => void = () => undefined
		decodeWaveformPeaks.mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
		decodeWaveformPeaks.mockResolvedValueOnce([1, 0.5, 0.25])
		const { container, rerender } = setup({ peaks: undefined, bars: 3 })
		const heights = (): string[] => [...container.querySelectorAll<HTMLElement>('.base-waveform__bar')].map(bar => bar.style.height)
		expect(heights()).toEqual(['30%', '30%', '30%'])
		await rerender({ src: '/other.webm' })
		resolveFirst([0.1, 0.1, 0.1])
		await vi.waitFor(() => expect(heights()).toEqual(['100%', '50%', '25%']))
		expect(decodeWaveformPeaks.mock.calls).toEqual([
			['/voice.webm', 3],
			['/other.webm', 3],
		])
	})

	it('опасный адрес не загружается и не декодируется; адрес без bars — 48 столбиков', async () => {
		const { audio, container, rerender } = setup({ src: 'javascript:alert(1)', peaks: undefined })
		expect(audio).not.toHaveAttribute('src')
		expect(decodeWaveformPeaks).not.toHaveBeenCalled()
		await rerender({ bars: undefined })
		expect(container.querySelectorAll('.base-waveform__bar')).toHaveLength(48)
	})

	it('отключённый плеер не запускается и не перематывается', async () => {
		const { fake, rerender } = setup({ isDisabled: true })
		fake.emit('durationchange')
		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		await fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
		await rerender({ currentTime: 6 })
		expect(fake.play).not.toHaveBeenCalled()
		expect(fake.values.currentTime).toBe(0)
		expect(screen.getByRole('group')).toHaveClass('base-audio-player--disabled')
	})

	it('методы через ref: play, pause, getMediaElement; вид ghost и customClass', async () => {
		const wrapper = mount(BaseAudioPlayer, {
			props: { src: '/voice.webm', title: 'Голосовое', peaks: [1], variant: 'ghost', customClass: { rate: 'my-rate' } },
		})
		const audio = wrapper.get('audio').element as HTMLAudioElement
		const fake = fakeAudio(audio)
		const exposed = wrapper.vm as unknown as BaseAudioPlayerExpose
		await exposed.play()
		exposed.pause()
		expect(fake.play).toHaveBeenCalledOnce()
		expect(fake.pause).toHaveBeenCalledOnce()
		expect(exposed.getMediaElement()).toBe(audio)
		await wrapper.setProps({ isDisabled: true })
		await exposed.play()
		expect(fake.play).toHaveBeenCalledOnce()
		expect(wrapper.get('.base-waveform').classes()).toContain('base-waveform--soft')
		expect(wrapper.get('.base-audio-player__rate').classes()).toContain('my-rate')
		wrapper.unmount()
	})
})
