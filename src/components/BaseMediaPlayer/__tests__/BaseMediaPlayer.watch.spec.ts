import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import type { MediaWatchParty } from '../types/MediaWatch.types'
import type { BaseMediaPlayerExpose } from '../types/BaseMediaPlayer.types'

const PARTY: MediaWatchParty = {
	link: 'https://example.com/watch/room-1',
	members: [
		{ id: 'me', name: 'Анна Петрова', status: 'joined', isHost: true, avatar: '/anna.png' },
		{ id: 'b', name: 'Борис', email: 'boris@example.com', status: 'invited' },
	],
}

async function setup(props: { watchParty?: MediaWatchParty } = { watchParty: PARTY }) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const writeText = vi.fn(async () => undefined)
	Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
	const wrapper = mount(BaseMediaPlayer, {
		props: { title: 'Демо', sources: '/media/demo.webm', ...props },
		attachTo: document.body,
	})
	const fake = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { wrapper, fake, writeText }
}

describe('BaseMediaPlayer: совместный просмотр', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('кнопка со счётчиком смотрящих открывает окно: ссылка с копированием, приглашение по почте, участники', async () => {
		const { wrapper, writeText } = await setup()
		const button = wrapper.get('button[aria-label="Совместный просмотр"]')

		expect(button.text()).toContain('1')
		await button.trigger('click')
		const panel = wrapper.get('.base-media-player__watch')
		expect(panel.attributes('aria-label')).toBe('Совместный просмотр')
		const copy = panel.get('button[type="button"]')
		expect(document.activeElement).toBe(copy.element)
		const link = panel.get('input[readonly]')
		expect((link.element as HTMLInputElement).value).toBe('https://example.com/watch/room-1')
		const select = vi.spyOn(link.element as HTMLInputElement, 'select')
		await link.trigger('focus')
		expect(select).toHaveBeenCalledOnce()
		await copy.trigger('click')
		await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('https://example.com/watch/room-1'))

		const members = panel.findAll('.base-media-player__watch-member')
		expect(members.map(member => member.text().replace(/\s+/g, ' '))).toEqual([
			'Анна Петрова Ведущий',
			'Б Борис boris@example.com Приглашён',
		])
		expect(members[0].get('img').attributes('src')).toBe('/anna.png')
		expect(members[1].get('.base-media-player__watch-status').classes()).toContain('base-media-player__watch-status--invited')

		const email = panel.get('input[type="email"]')
		await email.setValue('кто-то')
		await panel.get('form').trigger('submit')
		expect(email.attributes('aria-invalid')).toBe('true')
		expect(panel.get('[role="alert"]').text()).toBe('Проверьте адрес почты')
		await email.setValue('vika@example.com')
		await panel.get('form').trigger('submit')
		expect(wrapper.emitted('watch-invite')).toEqual([['vika@example.com']])
		expect((email.element as HTMLInputElement).value).toBe('')
		expect(panel.find('[role="alert"]').exists()).toBe(false)
		wrapper.unmount()
	})

	it('без участников — подсказка; события watch-sync и applyWatchEvent через ref', async () => {
		const { wrapper, fake } = await setup({ watchParty: { link: 'https://example.com/watch/room-2' } })

		await wrapper.get('button[aria-label="Совместный просмотр"]').trigger('click')
		expect(wrapper.get('.base-media-player__watch-empty').text()).toBe('Пока никого — отправьте ссылку')
		fake.update({ currentTime: 12 }, 'seeked')
		expect(wrapper.emitted('watch-sync')).toEqual([[{ type: 'seek', time: 12 }]])
		;(wrapper.vm as unknown as BaseMediaPlayerExpose).applyWatchEvent({ type: 'play', time: 20 })
		expect(fake.values.currentTime).toBe(20)
		expect(fake.play).toHaveBeenCalledOnce()
		wrapper.unmount()
	})

	it('без комнаты кнопки нет', async () => {
		const { wrapper } = await setup({})
		expect(wrapper.find('button[aria-label="Совместный просмотр"]').exists()).toBe(false)
		wrapper.unmount()
	})
})
