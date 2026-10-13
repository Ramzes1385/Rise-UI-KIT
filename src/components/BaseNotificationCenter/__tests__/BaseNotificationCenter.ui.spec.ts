import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { NotificationCenterItem } from '../types/BaseNotificationCenter.types'

const NOW = new Date(2025, 4, 15, 10, 30)

const ITEMS: NotificationCenterItem[] = [
	{
		id: 'n1',
		title: 'Анна упомянула вас',
		text: 'Посмотрите макет',
		date: new Date(2025, 4, 15, 10, 25),
		avatar: 'data:image/png;base64,AA',
	},
	{ id: 'n2', title: 'Заказ оплачен', date: new Date(2025, 4, 15, 9, 30), icon: 'check-circle' },
	{ id: 'n3', title: 'Отчёт готов', date: new Date(2025, 4, 14, 18, 0), isRead: true },
]

const PARTS = [
	'header',
	'title',
	'count',
	'read-all',
	'list',
	'item',
	'main',
	'avatar',
	'icon',
	'body',
	'item-title',
	'text',
	'time',
	'dot',
	'toggle',
]

const part = (container: Element, name: string) => container.querySelector(`.base-notification-center__${name}`)

const transitionsOn = { stubs: { Transition: false, TransitionGroup: false } }

describe('BaseNotificationCenter: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseNotificationCenter, { props: { items: ITEMS, now: NOW } })

		expect(screen.getByRole('region')).toHaveAttribute('class', 'base-notification-center')
		expect(part(container, 'header')).toHaveAttribute('class', 'base-notification-center__header')
		expect(part(container, 'list')).toHaveAttribute('class', 'base-notification-center__list')
		expect(part(container, 'dot')).toHaveAttribute('class', 'base-badge base-badge--dot base-notification-center__dot')
	})

	it('классы частей добавляются к классам кита, customClass и модификаторы сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		const { container } = render(BaseNotificationCenter, {
			props: { items: ITEMS, now: NOW, variant: 'ghost', ui, customClass: { root: 'own-root', item: 'own-item' } },
		})

		expect(screen.getByRole('region')).toHaveClass('base-notification-center', 'u-root', 'base-notification-center--ghost', 'own-root')
		for (const name of PARTS) expect(part(container, name)).toHaveClass(`u-${name}`)
		expect(part(container, 'item')).toHaveClass('own-item', 'base-notification-center__item--unread')
	})

	it('пустой список — класс части empty; глобальные классы и умолчания из defaults.BaseNotificationCenter', () => {
		const { container } = render(BaseNotificationCenter, {
			props: { items: [], ui: { empty: 'own-empty' } },
			global: {
				plugins: [
					createUiKitPlugin({
						defaults: { BaseNotificationCenter: { title: 'Входящие', ui: { empty: 'app-empty', root: 'app-root' } } },
					}),
				],
			},
		})

		expect(part(container, 'empty')).toHaveClass('base-empty', 'base-notification-center__empty', 'app-empty', 'own-empty')
		expect(screen.getByRole('region', { name: 'Входящие' })).toHaveClass('app-root')
	})
})

describe('BaseNotificationCenter: переходы списка и точки', () => {
	const Host = defineComponent({
		components: { BaseNotificationCenter },
		setup: () => ({ items: ref(ITEMS), filter: ref('all'), now: NOW }),
		template: '<BaseNotificationCenter v-model:items="items" v-model:filter="filter" :now="now" />',
	})

	it('пункты — в TransitionGroup: уходящий при фильтре получает классы ухода и удаляется', async () => {
		const { container } = render(Host, { global: transitionsOn })
		const read = screen.getByRole('button', { name: /Отчёт готов/ }).closest('li')!

		await fireEvent.click(screen.getByRole('radio', { name: /Непрочитанные/ }))

		expect(read).toHaveClass('base-notification-center-item-leave-active')
		expect(part(container, 'list')!.tagName).toBe('UL')
		await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(2))
	})

	it('точка «не прочитано» уходит и появляется переходом base-notification-center-dot', async () => {
		const { container } = render(Host, { global: transitionsOn })
		const [dot] = container.querySelectorAll('.base-notification-center__dot')

		await fireEvent.click(screen.getAllByRole('button', { name: 'Отметить прочитанным' })[0])
		expect(dot).toHaveClass('base-notification-center-dot-leave-active')
		await waitFor(() => expect(container.querySelectorAll('.base-notification-center__dot')).toHaveLength(1))

		await fireEvent.click(screen.getAllByRole('button', { name: 'Отметить непрочитанным' })[0])
		expect(container.querySelector('.base-notification-center__dot')).toHaveClass('base-notification-center-dot-enter-active')
	})
})
