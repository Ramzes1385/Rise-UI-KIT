import '@testing-library/jest-dom/vitest'
import { defineComponent } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseNotification from '../ui/BaseNotification.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const ITEM = { id: 1, title: 'Сохранено', description: 'Изменения сохранены', actions: [{ label: 'Отменить' }] }
const ITEM_PARTS = ['icon', 'content', 'title', 'description', 'actions', 'close', 'progress'] as const

const region = () => screen.getByRole('region')

const card = () => region().querySelector<HTMLElement>('.base-notification-item')!

afterEach(() => {
	document.body.innerHTML = ''
})

describe('BaseNotification: проп ui', () => {
	it('без ui — только классы кита на области, списке, карточке и частях', () => {
		render(BaseNotification, { props: { items: [ITEM], isContained: true } })

		expect(region().className).toMatch(/^base-notification base-notification--top-right/)
		expect(region().querySelector('.base-notification-list')).toHaveAttribute('class', 'base-notification-list')
		expect(card().className).toMatch(/^base-notification-item base-notification-item--info/)
		expect(region().querySelector('.base-notification-item__content')).toHaveAttribute('class', 'base-notification-item__content')
		expect(region().querySelector('.base-notification-item__actions')).toHaveAttribute('class', 'base-notification-item__actions')
		expect(region().querySelector('.base-notification__item')).toBeNull()
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([
			['root', 'u-root'],
			['list', 'u-list'],
			['item', 'u-item'],
			...ITEM_PARTS.map(name => [name, `u-${name}`]),
		])
		render(BaseNotification, { props: { items: [ITEM], isContained: true, ui, customClass: { notification: 'own-item' } } })

		expect(region()).toHaveClass('base-notification', 'u-root')
		expect(region().querySelector('.base-notification-list')).toHaveClass('u-list')
		expect(card()).toHaveClass('base-notification-item', 'u-item', 'own-item')
		for (const name of ITEM_PARTS) expect(region().querySelector(`.base-notification-item__${name}`)).toHaveClass(`u-${name}`)
	})

	it('классы из defaults.BaseNotification.ui склеиваются с классами экземпляра', () => {
		render(BaseNotification, {
			props: { items: [ITEM], isContained: true, ui: { item: 'own-item' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseNotification: { ui: { item: 'app-item' } } } })] },
		})

		expect(card().className).toMatch(/^base-notification-item app-item own-item /)
	})
})

describe('BaseNotification: проп animation, имя области и тема', () => {
	it('по умолчанию карточки появляются масштабом (scale)', () => {
		render(BaseNotification, { props: { items: [ITEM], isContained: true } })

		expect(card()).toHaveClass('base-notification-item--animation-scale')
		expect(region()).toHaveAccessibleName('Уведомления')
	})

	it('заданная анимация и умолчание из defaults.BaseNotification.animation', () => {
		render(BaseNotification, { props: { items: [ITEM], isContained: true, animation: 'slide', ariaLabel: 'Загрузки' } })
		expect(card()).toHaveClass('base-notification-item--animation-slide')
		expect(region()).toHaveAccessibleName('Загрузки')
		document.body.innerHTML = ''

		render(BaseNotification, {
			props: { items: [ITEM], isContained: true },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseNotification: { animation: 'none' } } })] },
		})
		expect(card()).toHaveClass('base-notification-item--animation-none')
	})

	it('заголовок карточки — без inline-веса BaseText: вес задаёт стиль карточки и токен', () => {
		render(BaseNotification, { props: { items: [ITEM], isContained: true } })

		expect(region().querySelector('.base-notification-item__title')?.getAttribute('style') ?? '').not.toContain('font-weight')
	})

	it('телепортированная область наследует тему и пресет движения места компонента, когда есть уведомления', async () => {
		const Host = defineComponent({
			components: { BaseNotification },
			props: { items: { type: Array, default: () => [] } },
			template: `
				<div data-theme="dark" data-rise-theme="violet" data-rise-motion="subtle">
					<BaseNotification :items="items" />
				</div>
			`,
		})
		const { container, rerender } = render(Host)

		expect(region()).not.toHaveAttribute('data-rise-motion')
		await rerender({ items: [ITEM] })

		await waitFor(() => expect(region()).toHaveAttribute('data-rise-motion', 'subtle'))
		expect(region()).toHaveAttribute('data-rise-theme', 'violet')
		expect(region()).toHaveAttribute('data-theme', 'dark')
		expect(container.contains(region())).toBe(false)
	})
})
