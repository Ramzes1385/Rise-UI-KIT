import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render, waitFor } from '@testing-library/vue'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'

const PEOPLE = ['Анна', 'Борис', 'Вера', 'Глеб', 'Дина', 'Егор'].map(name => ({ name }))
const global = { stubs: { TransitionGroup: false, Transition: false } }

const items = (container: Element) => [...container.querySelectorAll<HTMLElement>('li')]
const count = (container: Element) => [...container.querySelectorAll('.base-avatar-group__count')].map(el => el.textContent)

describe('BaseAvatarGroup: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseAvatarGroup, { props: { items: PEOPLE, max: 2 }, global })
		const [first] = items(container)

		expect(container.querySelector('ul')).toHaveAttribute('class', 'base-avatar-group')
		expect(first).toHaveAttribute('class', 'base-avatar-group__item')
		expect(first.querySelector('.base-avatar-group__name')).toHaveAttribute('class', 'base-avatar-group__name')
		expect(container.querySelector('.base-avatar-group__more')).toHaveAttribute(
			'class',
			'base-avatar-group__item base-avatar-group__more base-avatar-group__more--circle',
		)
		expect(container.querySelector('.base-avatar-group__count')).toHaveAttribute('class', 'base-avatar-group__count')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = { root: 'u-root', item: 'u-item', name: 'u-name', more: 'u-more', count: 'u-count' }
		const { container } = render(BaseAvatarGroup, {
			props: { items: PEOPLE, max: 2, variant: 'soft', customClass: { root: 'own-root', more: 'own-more' }, ui },
			global,
		})

		expect(container.querySelector('ul')).toHaveClass('base-avatar-group', 'u-root', 'base-avatar-group--soft', 'own-root')
		expect(items(container)[0]).toHaveClass('u-item')
		expect(container.querySelector('.base-avatar-group__name')).toHaveClass('u-name')
		expect(container.querySelector('.base-avatar-group__more')).toHaveClass('u-item', 'u-more', 'own-more')
		expect(container.querySelector('.base-avatar-group__count')).toHaveClass('u-count')
	})

	it('классы из defaults.BaseAvatarGroup.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAvatarGroup, {
			props: { items: PEOPLE, max: 2, ui: { more: 'own-more' } },
			global: {
				...global,
				plugins: [createUiKitPlugin({ defaults: { BaseAvatarGroup: { ui: { root: 'app-root', more: 'app-more' } } } })],
			},
		})

		expect(container.querySelector('ul')).toHaveClass('app-root')
		expect(container.querySelector('.base-avatar-group__more')).toHaveClass('app-more', 'own-more')
	})
})

describe('BaseAvatarGroup: состав и «+N»', () => {
	it('первый показ — без анимаций', () => {
		const { container } = render(BaseAvatarGroup, { props: { items: PEOPLE, max: 2 }, global })

		for (const item of items(container)) expect(item.className).not.toMatch(/enter/)
	})

	it('пришедший появляется с pop, ушедший закреплён на месте и уходит из разметки', async () => {
		const { container, rerender } = render(BaseAvatarGroup, { props: { items: PEOPLE.slice(0, 3), max: 6 }, global })

		await rerender({ items: [...PEOPLE.slice(0, 3), PEOPLE[3]] })
		expect(items(container)[3]).toHaveClass('base-avatar-group-item-enter-active')

		await rerender({ items: PEOPLE.slice(1, 4) })
		const leaving = container.querySelector<HTMLElement>('.base-avatar-group-item-leave-active')!
		expect(leaving).toHaveTextContent('Анна')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.margin).toBe('0px')
		await waitFor(() => expect(items(container)).toHaveLength(3))
	})

	it('смена числа «+N» — pop нового значения по ключу, старое уходит', async () => {
		const { container, rerender } = render(BaseAvatarGroup, { props: { items: PEOPLE, max: 2 }, global })

		await rerender({ max: 1 })

		expect(count(container)).toEqual(['+4', '+5'])
		expect(container.querySelector('.base-avatar-group-count-enter-active')).toHaveTextContent('+5')
		await waitFor(() => expect(count(container)).toEqual(['+5']))
	})

	it('люди с одинаковым именем различаются по порядку', () => {
		const { container } = render(BaseAvatarGroup, { props: { items: [{ name: 'Анна' }, { name: 'Анна' }] }, global })

		expect(items(container)).toHaveLength(2)
	})
})
