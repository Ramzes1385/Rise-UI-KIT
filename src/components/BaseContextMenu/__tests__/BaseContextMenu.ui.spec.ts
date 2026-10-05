import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import type { Plugin } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseContextMenu from '../ui/BaseContextMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'

const ITEMS: DropdownMenuItem[][] = [
	[
		{ type: 'label', label: 'Серия' },
		{ label: 'Открыть', icon: 'eye', shortcut: 'Enter' },
		{ label: 'Ещё', children: [{ label: 'Архив' }] },
	],
	[{ label: 'Удалить', isDanger: true }],
]
const PARTS = ['content', 'group', 'item', 'label', 'separator', 'shortcut', 'icon'] as const

async function openMenu(props: Record<string, unknown> = {}, plugins: Plugin[] = []) {
	const utils = render(BaseContextMenu, {
		props: { items: ITEMS, ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Серия 3') },
		global: { plugins },
	})
	screen.getByRole('button', { name: 'Серия 3' }).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
	await nextTick()
	await nextTick()
	return utils
}

const panel = () => document.querySelector<HTMLElement>('.base-dropdown__panel')
const part = (name: string) => document.querySelector(`.base-dropdown-menu__${name}`)

describe('BaseContextMenu: проп ui', () => {
	it('части меню получают классы BaseDropdownMenu и свои', async () => {
		const { container } = await openMenu()

		expect(container.firstElementChild).toHaveClass('base-context-menu')
		expect(panel()).toHaveClass('base-dropdown-menu__panel', 'base-context-menu__panel')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-context-menu__${name}`)
	})

	it('классы ui и defaults.BaseContextMenu.ui добавляются к частям', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ['panel', 'u-panel'], ...PARTS.map(name => [name, `u-${name}`])])
		const plugin = createUiKitPlugin({ defaults: { BaseContextMenu: { ui: { item: 'app-item' } } } })
		const { container } = await openMenu({ ui }, [plugin])

		expect(container.firstElementChild).toHaveClass('base-context-menu', 'u-root')
		expect(panel()).toHaveClass('u-panel')
		for (const name of PARTS) expect(part(name)).toHaveClass(`u-${name}`)
		expect(screen.getByRole('menuitem', { name: 'Открыть' })).toHaveClass('app-item', 'u-item')
	})
})

describe('BaseContextMenu: анимация', () => {
	it('по умолчанию scale', async () => {
		await openMenu()

		expect(panel()).toHaveClass('base-dropdown__panel--animation-scale', 'base-dropdown__panel--side-bottom')
	})

	it('проп animation уходит в панель и подменю, панель подменю — тоже панель контекстного меню', async () => {
		await openMenu({ animation: 'slide' })
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Ещё' }))
		await nextTick()

		const panels = document.querySelectorAll('.base-dropdown__panel')
		expect(panels).toHaveLength(2)
		for (const item of panels) expect(item).toHaveClass('base-dropdown__panel--animation-slide', 'base-context-menu__panel')
	})
})
