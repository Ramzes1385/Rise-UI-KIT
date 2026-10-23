import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { fakeAudio } from './audio.test-utils'
import BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { AUDIO_PLAYER_PARTS } from '../types/BaseAudioPlayer.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const decodeWaveformPeaks = vi.hoisted(() => vi.fn(async (_src: string, _bars: number): Promise<number[] | null> => null))

vi.mock('@utils/media/mediaUtils', async original => ({ ...(await original<object>()), decodeWaveformPeaks }))

const VTT = ['WEBVTT', '', '00:00.000 --> 00:04.000', '<v Анна>Привет', '', '00:04.000 --> 00:08.000', 'Без говорящего'].join('\n')
const motionGlobal = { stubs: { transition: false } }

function setup(props: Record<string, unknown> = {}, global: Record<string, unknown> = {}) {
	const result = render(BaseAudioPlayer, {
		props: { src: '/voice.webm', title: 'Подкаст', peaks: [0.5, 1], ...props },
		global,
	})
	const audio = result.container.querySelector('audio') as HTMLAudioElement
	return { ...result, fake: fakeAudio(audio, { duration: 12 }) }
}

describe('BaseAudioPlayer: проп ui', () => {
	beforeEach(() => {
		HTMLElement.prototype.scrollTo = vi.fn()
	})

	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...AUDIO_PLAYER_PARTS.map(part => [part, `u-${part}`])])
		const { container, fake } = setup({
			ui,
			hasTitle: true,
			transcript: VTT,
			isTranscriptOpen: true,
			customClass: { time: 'own-time' },
		})
		fake.update({ error: { code: 2 } }, 'error')
		await waitFor(() => expect(container.querySelector('.base-audio-player__cue')).toBeInTheDocument())
		await fireEvent.wheel(container.querySelector('.base-audio-player__transcript-list')!)
		await nextTick()
		const root = container.querySelector('.base-audio-player')!
		expect(root).toHaveClass('base-audio-player', 'u-root')
		const absent = ['transcript-note']
		for (const part of AUDIO_PLAYER_PARTS.filter(name => !absent.includes(name)))
			expect(root.querySelector(`.base-audio-player__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-audio-player__time')).toHaveClass('own-time')
	})

	it('заметка панели получает класс ui', async () => {
		const { container } = setup({ ui: { 'transcript-note': 'u-note' }, transcript: 'WEBVTT\n', isTranscriptOpen: true })
		await waitFor(() => expect(container.querySelector('.base-audio-player__transcript-note')).toHaveClass('u-note'))
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = setup(
			{ ui: { time: 'own' } },
			{ plugins: [createUiKitPlugin({ defaults: { BaseAudioPlayer: { ui: { time: 'app', root: 'app-root' } } } })] },
		)
		expect(container.querySelector('.base-audio-player')).toHaveClass('app-root')
		expect(container.querySelector('.base-audio-player__time')).toHaveAttribute('class', 'base-audio-player__time app own')
		expect(container.querySelector('.base-audio-player__body')).toHaveAttribute('class', 'base-audio-player__body')
	})
})

describe('BaseAudioPlayer: движение кнопки пуска', () => {
	it('новый значок появляется переходом base-audio-player__icon, прежний уходит без перехода', async () => {
		const { container } = setup({}, motionGlobal)
		const button = screen.getByRole('button', { name: 'Воспроизвести' })
		expect(button.querySelector('.base-audio-player__icon-enter-active')).not.toBeInTheDocument()
		await fireEvent.click(button)
		await nextTick()
		const entering = container.querySelector('.base-audio-player__icon-enter-active')
		expect(entering).toBeInTheDocument()
		expect(button).toHaveAccessibleName('Пауза')
		await waitFor(() => expect(button.querySelectorAll('.base-icon')).toHaveLength(1))
	})
})
