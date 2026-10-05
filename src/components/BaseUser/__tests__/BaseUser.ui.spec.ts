import '@testing-library/jest-dom/vitest'
import BaseUser from '../ui/BaseUser.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

const PROPS = { name: 'Анна Смирнова', description: 'Дизайнер', isOnline: true }

describe('BaseUser: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseUser, { props: PROPS })
		const root = container.querySelector('.base-user')!

		expect(root).toHaveAttribute('class', 'base-user base-user--horizontal')
		expect(root.querySelector('.base-user__text')).toHaveAttribute('class', 'base-user__text')
		expect(root.querySelector('.base-user__name')).toHaveAttribute('class', 'base-user__name')
		expect(root.querySelector('.base-user__status')).toHaveAttribute('class', 'base-user__status')
		expect(root.querySelector('.base-user__description')).toHaveAttribute('class', 'base-user__description')
		expect(root.querySelector('.base-avatar')).toHaveClass('base-user__avatar')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseUser, {
			props: {
				...PROPS,
				orientation: 'vertical',
				customClass: { root: 'own-root', name: 'own-name', avatar: 'own-avatar' },
				ui: {
					root: 'u-root',
					avatar: 'u-avatar',
					text: 'u-text',
					name: 'u-name',
					status: 'u-status',
					description: 'u-description',
				},
			},
		})
		const root = container.querySelector('.base-user')!

		expect(root).toHaveClass('base-user', 'u-root', 'base-user--vertical', 'own-root')
		expect(root.querySelector('.base-avatar')).toHaveClass('base-user__avatar', 'u-avatar', 'own-avatar')
		expect(root.querySelector('.base-user__text')).toHaveClass('u-text')
		expect(root.querySelector('.base-user__name')).toHaveClass('u-name', 'own-name')
		expect(root.querySelector('.base-user__status')).toHaveClass('u-status')
		expect(root.querySelector('.base-user__description')).toHaveClass('u-description')
	})

	it('у ссылки класс root ложится на BaseLink вместе с классами кита', () => {
		render(BaseUser, { props: { name: 'Мария', href: 'https://example.com/maria', ui: { root: 'u-root' } } })

		expect(screen.getByRole('link', { name: /Мария/ })).toHaveClass('base-link', 'base-user', 'u-root', 'base-user--link')
	})

	it('классы из defaults.BaseUser.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseUser, {
			props: { ...PROPS, ui: { name: 'own-name' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseUser: { ui: { root: 'app-root', name: 'app-name' } } } })] },
		})

		expect(container.querySelector('.base-user')).toHaveClass('base-user', 'app-root')
		expect(container.querySelector('.base-user__name')).toHaveAttribute('class', 'base-user__name app-name own-name')
	})
})
