import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerExpose } from '../types/BaseMediaPlayer.types'

const BANNERS = [
	{ id: 'sale', start: 5, text: 'Скидка', href: 'https://example.com/sale', image: '/sale.webp', position: 'top-right' as const },
	{ id: 'note', start: 5, text: 'Без ссылки', isClosable: false },
]

async function setup(options: { props?: Record<string, unknown>; slots?: Record<string, (...args: never[]) => unknown> } = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, {
		props: { sources: '/media/demo.webm', title: 'Демо', ...options.props },
		slots: options.slots as Record<string, () => unknown> | undefined,
		attachTo: document.body,
	})
	const fake = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { wrapper, fake }
}

describe('BaseMediaPlayer: баннеры и достижения', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('баннеры в своё время: ссылка в новой вкладке, картинка, «Закрыть»; события banner', async () => {
		const { wrapper, fake } = await setup({ props: { banners: BANNERS } })
		fake.update({ currentTime: 6 }, 'seeked')
		await nextTick()

		const [sale, note] = wrapper.findAll('.base-media-player__banner')
		expect(sale.classes()).toContain('base-media-player__banner--top-right')
		expect(sale.get('a').attributes()).toMatchObject({ href: 'https://example.com/sale', target: '_blank', rel: 'noopener noreferrer' })
		expect(sale.get('img').attributes('src')).toBe('/sale.webp')
		expect(note.classes()).toContain('base-media-player__banner--bottom-left')
		expect(note.find('a').exists()).toBe(false)
		expect(note.find('button').exists()).toBe(false)
		await sale.get('a').trigger('click')
		await sale.get('button').trigger('click')
		expect(wrapper.findAll('.base-media-player__banner')).toHaveLength(1)
		expect((wrapper.emitted<[{ type: string }]>('banner') ?? []).map(([event]) => event.type)).toEqual([
			'show',
			'show',
			'click',
			'close',
		])
		wrapper.unmount()
	})

	it('закрытый баннер возвращается при повторном просмотре и в новой серии', async () => {
		const { wrapper, fake } = await setup({ props: { banners: [BANNERS[0]] } })
		fake.update({ currentTime: 6 }, 'seeked')
		await nextTick()
		await wrapper.get('.base-media-player__banner button').trigger('click')
		expect(wrapper.find('.base-media-player__banner').exists()).toBe(false)

		fake.update({ currentTime: 7 }, 'seeked')
		await nextTick()
		expect(wrapper.find('.base-media-player__banner').exists()).toBe(false)

		fake.update({ currentTime: 30, ended: true }, 'ended')
		await nextTick()
		fake.update({ currentTime: 6, ended: false }, 'seeked')
		await nextTick()
		expect(wrapper.find('.base-media-player__banner').exists()).toBe(true)

		await wrapper.get('.base-media-player__banner button').trigger('click')
		await wrapper.setProps({ banners: [{ ...BANNERS[0] }] })
		expect(wrapper.find('.base-media-player__banner').exists()).toBe(true)
		wrapper.unmount()
	})

	it('свой вид баннера через слот banner', async () => {
		const { wrapper, fake } = await setup({
			props: { banners: [BANNERS[0]] },
			slots: {
				banner: ({ banner, close }: { banner: { text: string }; close: () => void }) =>
					h('button', { class: 'custom', onClick: close }, banner.text),
			},
		})
		fake.update({ currentTime: 6 }, 'seeked')
		await nextTick()

		await wrapper.get('.custom').trigger('click')
		expect(wrapper.find('.base-media-player__banner').exists()).toBe(false)
		wrapper.unmount()
	})

	it('достижение всплывает при досмотре до нужной секунды и по команде; щелчок закрывает уведомление', async () => {
		const achievements = [
			{ id: 'first', title: 'Первые минуты', description: 'Смотрите дальше', icon: '/badge.png', at: 3 },
			{ id: 'bonus', title: 'Бонус' },
		]
		const { wrapper, fake } = await setup({ props: { achievements } })
		fake.update({ paused: false }, 'play')
		fake.update({ currentTime: 4 }, 'seeked')
		await nextTick()

		const toast = wrapper.get('.base-media-player__achievement')
		expect(toast.attributes('role')).toBe('status')
		expect(toast.text()).toContain('Достижение получено')
		expect(toast.text()).toContain('Первые минуты')
		expect(toast.get('img').attributes('src')).toBe('/badge.png')
		await toast.trigger('click')
		expect(wrapper.find('.base-media-player__achievement').exists()).toBe(false)
		;(wrapper.vm as unknown as BaseMediaPlayerExpose).awardAchievement('bonus')
		await nextTick()
		expect(wrapper.get('.base-media-player__achievement').text()).toContain('Бонус')
		expect(wrapper.find('.base-media-player__achievement img').exists()).toBe(false)
		expect(wrapper.emitted('achievement')?.map(([item]) => (item as { id: string }).id)).toEqual(['first', 'bonus'])
		wrapper.unmount()
	})
})
