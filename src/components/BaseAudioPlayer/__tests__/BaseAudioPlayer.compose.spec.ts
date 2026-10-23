import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fakeAudio } from './audio.test-utils'
import BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const decodeWaveformPeaks = vi.hoisted(() => vi.fn(async (_src: string, _bars: number): Promise<number[] | null> => null))

vi.mock('@utils/media/mediaUtils', async original => ({ ...(await original<object>()), decodeWaveformPeaks }))

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseAudioPlayer, { props: { src: '/voice.webm', title: 'Голосовое', peaks: [0.5, 1], ...props } })
	const audio = result.container.querySelector('audio') as HTMLAudioElement
	return { ...result, fake: fakeAudio(audio, { duration: 12 }) }
}

describe('BaseAudioPlayer: кнопка скорости на BaseButton', () => {
	it('клик переключает скорость: текст и доступное имя', async () => {
		const { fake } = setup()
		const rate = screen.getByRole('button', { name: 'Скорость 1×' })

		expect(rate).toHaveAttribute('type', 'button')
		expect(rate).toHaveTextContent('1×')
		await fireEvent.click(rate)
		await nextTick()
		expect(fake.values.playbackRate).toBe(1.5)
		expect(rate).toHaveTextContent('1,5×')
		expect(rate).toHaveAccessibleName('Скорость 1,5×')
	})

	it('customClass.rate и прежний класс на кнопке', () => {
		setup({ customClass: { rate: 'my-rate' } })
		const rate = screen.getByRole('button', { name: 'Скорость 1×' })

		expect(rate).toHaveClass('base-button', 'base-audio-player__rate', 'my-rate')
		expect(rate).toBeEnabled()
	})

	it('isDisabled отключает кнопку скорости', async () => {
		const { fake } = setup({ isDisabled: true })
		const rate = screen.getByRole('button', { name: 'Скорость 1×' })

		expect(rate).toBeDisabled()
		await fireEvent.click(rate)
		expect(fake.values.playbackRate).toBe(1)
	})
})
