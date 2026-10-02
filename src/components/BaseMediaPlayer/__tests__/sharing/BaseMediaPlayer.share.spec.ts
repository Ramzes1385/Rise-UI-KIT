import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../../types/BaseMediaPlayer.types'

const LINK = 'https://example.com/watch/7'

async function setup(props: Partial<BaseMediaPlayerProps> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, {
		props: { title: 'Демо', sources: '/media/demo.webm', hasShare: true, shareUrl: LINK, poster: '/media/poster.jpg', ...props },
		attachTo: document.body,
	})
	const fake = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 600, currentTime: 83.4 })
	await nextTick()
	fake.emit('loadedmetadata')
	fake.emit('timeupdate')
	await nextTick()
	return { wrapper, fake }
}

async function open(wrapper: VueWrapper) {
	await wrapper.get('button[aria-label="Поделиться"]').trigger('click')
	await nextTick()
	return wrapper.get('.base-media-player__share .base-modal__content')
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
}

describe('BaseMediaPlayer: «Поделиться»', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		Reflect.deleteProperty(navigator, 'clipboard')
		Reflect.deleteProperty(navigator, 'share')
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('без has-share кнопки и окна нет; с ним кнопка открывает окно со всеми соцсетями', async () => {
		const plain = await setup({ hasShare: false })
		expect(plain.wrapper.find('button[aria-label="Поделиться"]').exists()).toBe(false)
		expect(plain.wrapper.find('.base-media-player__share').exists()).toBe(false)
		plain.wrapper.unmount()

		const { wrapper } = await setup()
		const button = wrapper.get('button[aria-label="Поделиться"]')
		expect(button.attributes('aria-expanded')).toBe('false')
		const dialog = await open(wrapper)

		expect(button.attributes('aria-expanded')).toBe('true')
		expect(dialog.get('.base-modal__title').text()).toBe('Поделиться')
		const links = dialog.findAll('.base-media-player__share-link')
		expect(links).toHaveLength(19)
		expect(links[0].attributes()).toMatchObject({
			href: `https://vk.com/share.php?url=${encodeURIComponent(LINK)}&title=${encodeURIComponent('Демо')}`,
			target: '_blank',
			rel: 'noopener noreferrer',
		})
		expect(links[0].text()).toBe('ВКонтакте')
		expect(links[4].attributes('target')).toBeUndefined()
		expect(dialog.get('a[href*="pinterest"]').attributes('href')).toContain(
			encodeURIComponent(new URL('/media/poster.jpg', window.location.href).toString()),
		)
		expect((dialog.get('input[readonly]').element as HTMLInputElement).value).toBe(LINK)
		expect(dialog.find('.base-media-player__share-tile--more').exists()).toBe(false)
	})

	it('клик по соцсети — событие share; «Начать с 1:23» добавляет позицию в ссылку и в событие', async () => {
		const { wrapper } = await setup()
		const dialog = await open(wrapper)
		dialog.get('a[href^="https://t.me"]').element.addEventListener('click', event => event.preventDefault())

		await dialog.get('a[href^="https://t.me"]').trigger('click')
		const check = dialog.get('input[type="checkbox"]')
		expect(dialog.get('.base-media-player__share-time').text()).toBe('Начать с 1:23')
		await check.setValue(true)
		const withTime = `${LINK}?t=83`
		expect((dialog.get('input[readonly]').element as HTMLInputElement).value).toBe(withTime)
		expect(dialog.get('a[href^="mailto:"]').attributes('href')).toBe(
			`mailto:?subject=${encodeURIComponent('Демо')}&body=${encodeURIComponent(withTime)}`,
		)
		dialog.get('a[href^="mailto:"]').element.addEventListener('click', event => event.preventDefault())
		await dialog.get('a[href^="mailto:"]').trigger('click')

		expect(wrapper.emitted('share')).toEqual([[{ target: 'telegram', url: LINK }], [{ target: 'email', url: withTime, time: 83 }]])
	})

	it('«Копировать»: ссылка в буфере, на кнопке «Скопировано» 2 с; без доступа к буферу ссылка выделяется', async () => {
		vi.useFakeTimers()
		const writeText = vi.fn(async (_text: string) => undefined)
		stubClipboard(writeText)
		const { wrapper } = await setup()
		const dialog = await open(wrapper)
		const copy = dialog.get('.base-media-player__share-copy')

		await copy.trigger('click')
		await flushPromises()
		expect(writeText).toHaveBeenCalledWith(LINK)
		expect(copy.text()).toBe('Скопировано')
		expect(copy.classes()).toContain('base-media-player__share-copy--done')
		expect(wrapper.emitted('share')).toEqual([[{ target: 'copy', url: LINK }]])
		vi.advanceTimersByTime(2000)
		await nextTick()
		expect(copy.text()).toBe('Копировать')

		stubClipboard(async () => Promise.reject(new Error('denied')))
		const input = dialog.get('input[readonly]').element as HTMLInputElement
		const select = vi.spyOn(input, 'select')
		await copy.trigger('click')
		await flushPromises()
		expect(select).toHaveBeenCalledOnce()
		expect(copy.text()).toBe('Копировать')
		expect(wrapper.emitted('share')).toHaveLength(1)
		await dialog.get('input[readonly]').trigger('focus')
		expect(select).toHaveBeenCalledTimes(2)
	})

	it('системное окно «Ещё» там, где есть Web Share; отказ зрителя — без события', async () => {
		const share = vi.fn(async (_data: ShareData) => undefined)
		Object.defineProperty(navigator, 'share', { configurable: true, value: share })
		const { wrapper } = await setup({ shareNetworks: ['telegram', 'vk'] })
		const dialog = await open(wrapper)

		expect(dialog.findAll('.base-media-player__share-label').map(label => label.text())).toEqual(['Telegram', 'ВКонтакте', 'Ещё'])
		await dialog.get('.base-media-player__share-tile--more').trigger('click')
		await flushPromises()
		expect(share).toHaveBeenCalledWith({ title: 'Демо', url: LINK })
		expect(wrapper.emitted('share')).toEqual([[{ target: 'system', url: LINK }]])

		share.mockRejectedValueOnce(new DOMException('cancel', 'AbortError'))
		await dialog.get('.base-media-player__share-tile--more').trigger('click')
		await flushPromises()
		expect(wrapper.emitted('share')).toHaveLength(1)
	})

	it('стрелки прокрутки ряда соцсетей появляются по краям и листают ряд', async () => {
		const { wrapper } = await setup()
		const dialog = await open(wrapper)
		const list = dialog.get('.base-media-player__share-list')
		const element = list.element as HTMLElement
		const scrollBy = vi.fn()
		Object.assign(element, { scrollBy })
		Object.defineProperties(element, {
			clientWidth: { configurable: true, value: 300 },
			scrollWidth: { configurable: true, value: 1400 },
			scrollLeft: { configurable: true, writable: true, value: 0 },
		})

		expect(dialog.find('.base-media-player__share-scroll').exists()).toBe(false)
		await list.trigger('scroll')
		expect(dialog.find('.base-media-player__share-scroll--back').exists()).toBe(false)
		await dialog.get('button[aria-label="Следующие соцсети"]').trigger('click')
		expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: 'smooth' })

		element.scrollLeft = 1100
		await list.trigger('scroll')
		expect(dialog.find('.base-media-player__share-scroll--forward').exists()).toBe(false)
		await dialog.get('button[aria-label="Предыдущие соцсети"]').trigger('click')
		expect(scrollBy).toHaveBeenLastCalledWith({ left: -240, behavior: 'smooth' })
	})

	it('при уменьшении движения ряд листается без анимации; ResizeObserver пересчитывает стрелки', async () => {
		const observers: Array<{ callback: () => void; targets: Element[]; disconnect: ReturnType<typeof vi.fn> }> = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				disconnect = vi.fn()
				targets: Element[] = []
				callback: () => void
				constructor(callback: () => void) {
					this.callback = callback
					observers.push(this)
				}
				observe(target: Element): void {
					this.targets.push(target)
				}
			},
		)
		vi.stubGlobal('matchMedia', (query: string) => ({
			matches: query.includes('reduce'),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}))
		const { wrapper } = await setup()
		const dialog = await open(wrapper)
		const element = dialog.get('.base-media-player__share-list').element as HTMLElement
		const scrollBy = vi.fn()
		Object.assign(element, { scrollBy })
		Object.defineProperties(element, {
			clientWidth: { configurable: true, value: 300 },
			scrollWidth: { configurable: true, value: 900 },
		})

		const observer = observers.find(item => item.targets.includes(element))
		observer?.callback()
		await nextTick()
		await dialog.get('button[aria-label="Следующие соцсети"]').trigger('click')
		expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: 'auto' })
		wrapper.unmount()
		expect(observer?.disconnect).toHaveBeenCalled()
		vi.unstubAllGlobals()
	})

	it('окно закрывается крестиком и повторным нажатием кнопки; при новом открытии позиция берётся заново', async () => {
		const { wrapper, fake } = await setup()
		let dialog = await open(wrapper)
		await dialog.get('input[type="checkbox"]').setValue(true)
		await dialog.get('.base-modal__close').trigger('click')
		await nextTick()
		expect(wrapper.find('.base-media-player__share .base-modal__content').exists()).toBe(false)

		fake.update({ currentTime: 125 }, 'seeked')
		await nextTick()
		dialog = await open(wrapper)
		expect(dialog.get('.base-media-player__share-time').text()).toBe('Начать с 2:05')
		expect((dialog.get('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false)
		await wrapper.get('button[aria-label="Поделиться"]').trigger('click')
		await nextTick()
		expect(wrapper.find('.base-media-player__share .base-modal__content').exists()).toBe(false)
	})
})
