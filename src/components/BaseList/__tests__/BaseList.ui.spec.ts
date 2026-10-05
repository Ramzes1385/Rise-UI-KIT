import '@testing-library/jest-dom/vitest'
import BaseList from '../ui/BaseList.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import type { ListItem } from '../types/BaseList.types'

const ROWS: ListItem[] = [
	{ id: 'a', title: 'Альфа', description: 'Первая', meta: '12', icon: 'inbox' },
	{ id: 'b', title: 'Бета' },
]

const PARTS = {
	root: 'u-root',
	label: 'u-label',
	viewport: 'u-viewport',
	list: 'u-list',
	item: 'u-item',
	grip: 'u-grip',
	prefix: 'u-prefix',
	text: 'u-text',
	title: 'u-title',
	description: 'u-description',
	meta: 'u-meta',
	check: 'u-check',
	error: 'u-error',
}

describe('BaseList: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseList, { props: { items: ROWS, label: 'Разделы' } })

		expect(container.querySelector('.base-list')).toHaveAttribute('class', 'base-list')
		expect(container.querySelector('.base-list__viewport')).toHaveAttribute('class', 'base-list__viewport')
		expect(container.querySelector('.base-list__title')).toHaveAttribute('class', 'base-list__title')
		expect(container.querySelector('.base-list__item')).toHaveClass('base-list__item')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseList, {
			props: {
				items: ROWS,
				label: 'Разделы',
				selectionMode: 'single',
				modelValue: 'a',
				isSortable: true,
				error: 'Ошибка',
				variant: 'soft',
				customClass: { root: 'own-root', item: 'own-item' },
				ui: PARTS,
			},
		})
		const root = container.querySelector('.base-list')!

		expect(root).toHaveClass('u-root', 'base-list--soft', 'base-list--error', 'own-root')
		expect(container.querySelector('.base-list__item')).toHaveClass('u-item', 'own-item', 'base-list__item--selected')
		for (const [part, name] of Object.entries(PARTS).filter(([part]) => part !== 'root')) {
			expect(container.querySelector(`.base-list__${part}`), part).toHaveClass(name)
		}
	})

	it('пустой список и кнопки действий получают классы частей', () => {
		const empty = render(BaseList, { props: { items: [], ariaLabel: 'Разделы', ui: { empty: 'u-empty' } } })
		expect(empty.container.querySelector('.base-list__empty')).toHaveClass('u-empty')

		const actions = render(BaseList, {
			props: { items: ROWS, ariaLabel: 'Разделы', ui: { actions: 'u-actions' } },
			slots: { actions: '<button type="button">Открыть</button>' },
		})
		expect(actions.container.querySelector('.base-list__actions')).toHaveClass('u-actions')
	})

	it('классы из defaults.BaseList.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseList, {
			props: { items: ROWS, ariaLabel: 'Разделы', ui: { title: 'own-title' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseList: { ui: { root: 'app-root', title: 'app-title' } } } })] },
		})

		expect(container.querySelector('.base-list')).toHaveClass('base-list', 'app-root')
		expect(container.querySelector('.base-list__title')).toHaveAttribute('class', 'base-list__title app-title own-title')
	})
})
