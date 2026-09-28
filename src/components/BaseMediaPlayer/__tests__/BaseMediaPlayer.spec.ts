import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import { flushPromises, mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { domException, fakeMedia } from './BaseMediaPlayer.test-utils'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import type { BaseMediaPlayerExpose, BaseMediaPlayerProps } from '../types/BaseMediaPlayer.types'

const SOURCE = '/media/demo.webm'

function stubMediaPrototype() {
	return {
		play: vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(),
		pause: vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {}),
		load: vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {}),
	}
}

async function setup(props: Partial<BaseMediaPlayerProps> = {}, slots: Record<string, string> = {}) {
	stubMediaPrototype()
	const result = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', ...props }, slots })
	const video = result.container.querySelector('video') as HTMLVideoElement
	const fake = fakeMedia(video, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { ...result, video, fake }
}

describe('BaseMediaPlayer', () => {
	it('регион с именем, видео с источником, подписи контролов и время', async () => {
		const { video } = await setup({ poster: '/media/poster.webp' })
		await flushPromises()

		expect(screen.getByRole('region', { name: 'Демо' })).toHaveClass('base-media-player')
		expect(video.getAttribute('src')).toBe(SOURCE)
		expect(video.getAttribute('poster')).toBe('/media/poster.webp')
		expect(video).toHaveAttribute('preload', 'metadata')
		expect(video).toHaveAttribute('playsinline')
		expect(screen.getByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Выключить звук' })).toBeInTheDocument()
		expect(screen.getByRole('slider', { name: 'Перемотка' })).toHaveAttribute('aria-valuetext', '0:00 из 1:00')
		expect(screen.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-valuetext', expect.stringMatching(/^100\s%$/))
		expect(screen.getByText('0:00 / 1:00')).toHaveClass('base-media-player__time')
		expect(screen.queryByRole('button', { name: 'Во весь экран' })).toBeNull()
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('постер с опасной схемой не выводится, data: — выводится', async () => {
		const { video, rerender } = await setup({ poster: 'javascript:alert(1)' })
		expect(video).not.toHaveAttribute('poster')

		await rerender({ poster: 'data:image/png;base64,AAAA' })
		expect(video).toHaveAttribute('poster', 'data:image/png;base64,AAAA')
	})

	it('кнопка воспроизведения, события play, pause и ended', async () => {
		const { fake, emitted } = await setup()

		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		expect(fake.play).toHaveBeenCalledOnce()
		expect(screen.getByRole('button', { name: 'Пауза' })).toBeInTheDocument()

		await fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
		fake.emit('ended')
		expect(Object.keys(emitted())).toEqual(expect.arrayContaining(['play', 'pause', 'ended']))
	})

	it('звук и громкость: кнопка, ползунок, текст в процентах', async () => {
		const { fake } = await setup()

		await fireEvent.click(screen.getByRole('button', { name: 'Выключить звук' }))
		const volume = screen.getByRole('slider', { name: 'Громкость' })
		expect(fake.values.muted).toBe(true)
		expect(volume).toHaveAttribute('aria-valuenow', '0')
		expect(volume).toHaveAttribute('aria-valuetext', expect.stringMatching(/^0\s%$/))

		await fireEvent.keyDown(volume, { key: 'ArrowUp' })
		expect(fake.values).toMatchObject({ volume: 0.05, muted: false })
		expect(screen.getByRole('button', { name: 'Выключить звук' })).toBeInTheDocument()

		await fireEvent.keyDown(volume, { key: 'Home' })
		expect(screen.getByRole('button', { name: 'Включить звук' })).toBeInTheDocument()
	})

	it('ползунок перемотки переходит к позиции', async () => {
		const { fake } = await setup()

		await fireEvent.keyDown(screen.getByRole('slider', { name: 'Перемотка' }), { key: 'End' })
		expect(fake.values.currentTime).toBe(60)
		expect(screen.getByText('1:00 / 1:00')).toBeInTheDocument()
	})

	it.each([
		[1, 'Загрузка прервана'],
		[2, 'Ошибка сети. Проверьте подключение и попробуйте снова'],
		[3, 'Не удалось декодировать запись: файл может быть повреждён'],
		[4, 'Запись недоступна или её формат не поддерживается браузером'],
	])('ошибка MediaError %d: текст, событие error и «Повторить»', async (code, message) => {
		const { fake, emitted } = await setup()

		fake.update({ error: { code } }, 'error')
		const alert = await screen.findByRole('alert')
		expect(alert).toHaveTextContent(message)
		expect(emitted('error')?.[0]).toEqual([expect.objectContaining({ cause: { code } })])

		await fireEvent.click(within(alert).getByRole('button', { name: 'Повторить' }))
		expect(fake.load).toHaveBeenCalledOnce()
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('ошибка play() без кода MediaError', async () => {
		const { fake } = await setup()

		fake.play.mockRejectedValueOnce(new Error('boom'))
		await fireEvent.click(screen.getByRole('button', { name: 'Воспроизвести' }))
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось воспроизвести запись')
	})

	it('нет воспроизводимого источника: сообщение без «Повторить», источник не назначается', async () => {
		const { emitted, video } = await setup({ sources: [{ src: '/media/demo.mp4', type: 'video/mp4' }] })

		expect(screen.getByRole('alert')).toHaveTextContent('Запись недоступна или её формат не поддерживается браузером')
		expect(within(screen.getByRole('alert')).queryByRole('button')).toBeNull()
		expect(video).not.toHaveAttribute('src')
		expect(emitted('error')?.[0]).toEqual([{ code: 'unsupported' }])
	})

	it('автозапуск без звука; отказ браузера — подсказка и большая кнопка «Воспроизвести»', async () => {
		const { play } = stubMediaPrototype()
		play.mockRejectedValueOnce(domException('NotAllowedError'))
		const { container, emitted } = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', isAutoplay: true } })
		const video = container.querySelector('video') as HTMLVideoElement
		await flushPromises()

		expect(video.muted).toBe(true)
		expect(play).toHaveBeenCalledOnce()
		expect(screen.queryByRole('alert')).toBeNull()
		expect(screen.getByRole('status')).toHaveTextContent('Браузер не разрешил автозапуск. Нажмите «Воспроизвести»')
		expect(emitted('error')?.[0]).toEqual([expect.objectContaining({ code: 'autoplay-blocked' })])

		const fake = fakeMedia(video, { duration: 60 })
		await fireEvent.click(container.querySelector('.base-media-player__big-play') as HTMLElement)
		expect(fake.play).toHaveBeenCalledOnce()
		expect(container.querySelector('.base-media-player__start')).toBeNull()
	})

	it('слот error заменяет сообщение', async () => {
		const { fake } = await setup({}, { error: '<template #error="{ error }"><b>Код: {{ error.code }}</b></template>' })

		fake.update({ error: { code: 2 } }, 'error')
		expect(await screen.findByText('Код: network')).toBeInTheDocument()
	})

	it('customClass, sizeScale и пропорции кадра', async () => {
		const { container } = await setup({
			sizeScale: 125,
			aspectRatio: '4 / 3',
			customClass: {
				root: 'my-root',
				media: 'my-media',
				controls: 'my-controls',
				seek: 'my-seek',
				volume: 'my-volume',
				time: 'my-time',
			},
		})
		const root = container.querySelector('.base-media-player') as HTMLElement

		expect(root).toHaveClass('my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.style.aspectRatio).toBe('4 / 3')
		;['my-media', 'my-controls', 'my-seek', 'my-volume', 'my-time'].forEach(name =>
			expect(container.querySelector(`.${name}`)).not.toBeNull(),
		)
	})

	it('customClass overlay', async () => {
		const { container, fake } = await setup({ customClass: { overlay: 'my-overlay' } })

		fake.update({ error: { code: 2 } }, 'error')
		await flushPromises()
		expect(container.querySelector('.my-overlay')).not.toBeNull()
	})

	it('английские подписи после setLocale', async () => {
		await setup()
		setLocale('en')
		await flushPromises()

		expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
		expect(screen.getByRole('slider', { name: 'Seek' })).toHaveAttribute('aria-valuetext', '0:00 of 1:00')
	})

	it('expose: состояние, команды и медиаэлемент', async () => {
		stubMediaPrototype()
		const wrapper = mount(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо' } })
		const video = wrapper.get('video').element as HTMLVideoElement
		const fake = fakeMedia(video, { duration: 60 })
		await nextTick()
		fake.emit('loadedmetadata')
		const exposed = wrapper.vm as unknown as BaseMediaPlayerExpose

		expect(exposed.getMediaElement()).toBe(video)
		exposed.seek(12)
		expect(exposed.state.currentTime).toBe(12)
		wrapper.unmount()
	})
})
