import '@testing-library/jest-dom/vitest'
import type { Plugin } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { defineComponent, h, nextTick, reactive } from 'vue'
import type { DropdownMenuItem } from '../types/BaseDropdownMenu.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const ITEMS: DropdownMenuItem[][] = [
	[
		{ type: 'label', label: 'Файл' },
		{ label: 'Копировать', icon: 'copy', shortcut: 'Ctrl+C' },
		{ label: 'Ещё', children: [{ label: 'Архив' }] },
	],
	[{ label: 'Удалить', isDanger: true }],
]
const PARTS = ['content', 'group', 'item', 'label', 'separator', 'shortcut', 'icon'] as const

async function openMenu(props: Record<string, unknown> = {}, plugins: Plugin[] = []) {
	const utils = render(BaseDropdownMenu, {
		props: { items: ITEMS, ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Действия') },
		global: { plugins },
	})
	await fireEvent.click(screen.getByRole('button', { name: 'Действия' }))
	await nextTick()
	return utils
}

const panel = () => document.querySelector<HTMLElement>('.base-dropdown__panel')
const part = (name: string) => document.querySelector(`.base-dropdown-menu__${name}`)

describe('BaseDropdownMenu: проп ui', () => {
	it('без ui — только классы кита на частях', async () => {
		const { container } = await openMenu()

		expect(container.firstElementChild).toHaveAttribute('class', 'base-dropdown base-dropdown-menu')
		expect(part('trigger')).toHaveAttribute('class', 'base-dropdown-menu__trigger')
		expect(screen.getByRole('menu')).toHaveAttribute('class', 'base-dropdown-menu__content')
		expect(part('shortcut')).toHaveAttribute('class', 'base-dropdown-menu__shortcut')
		expect(panel()).toHaveClass('base-dropdown-menu__panel')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([
			['root', 'u-root'],
			['trigger', 'u-trigger'],
			['panel', 'u-panel'],
			...PARTS.map(name => [name, `u-${name}`]),
		])
		const { container } = await openMenu({ ui, customClass: { item: 'own-item', label: 'own-label' } })

		expect(container.firstElementChild).toHaveClass('base-dropdown-menu', 'u-root')
		expect(part('trigger')).toHaveClass('u-trigger')
		expect(panel()).toHaveClass('base-dropdown-menu__panel', 'u-panel')
		for (const name of PARTS) expect(part(name)).toHaveClass(`u-${name}`)
		expect(screen.getByRole('menuitem', { name: 'Копировать' })).toHaveClass('own-item', 'u-item')
		expect(part('label')).toHaveClass('own-label', 'u-label')
	})

	it('классы из defaults.BaseDropdownMenu.ui плагина склеиваются с классами экземпляра, панель подменю их получает', async () => {
		const plugin = createUiKitPlugin({ defaults: { BaseDropdownMenu: { ui: { panel: 'app-panel', item: 'app-item' } } } })
		await openMenu({ ui: { item: 'own-item' } }, [plugin])
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Ещё' }))
		await nextTick()

		const panels = document.querySelectorAll('.base-dropdown__panel')
		expect(panels).toHaveLength(2)
		for (const item of panels) expect(item).toHaveClass('base-dropdown-menu__panel', 'app-panel')
		expect(screen.getByRole('menuitem', { name: 'Архив' })).toHaveAttribute('class', 'base-dropdown-menu__item app-item own-item')
	})
})

describe('BaseDropdownMenu: анимация', () => {
	it('по умолчанию scale у меню', async () => {
		await openMenu()

		expect(panel()).toHaveClass('base-dropdown__panel--animation-scale', 'base-dropdown__panel--side-bottom')
	})

	it('проп animation уходит в меню и подменю', async () => {
		await openMenu({ animation: 'none', position: 'top-end' })
		expect(panel()).toHaveClass('base-dropdown__panel--side-top')
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Ещё' }))
		await nextTick()

		const panels = document.querySelectorAll('.base-dropdown__panel')
		expect(panels).toHaveLength(2)
		for (const item of panels) expect(item).toHaveClass('base-dropdown__panel--animation-none')
	})

	it('галочка флажка появляется и уходит через переход base-dropdown-menu-check', async () => {
		const state = reactive({ isChecked: false })
		const Host = defineComponent({
			components: { BaseDropdownMenu },
			setup: () => ({
				items: (): DropdownMenuItem[] => [
					{
						type: 'checkbox',
						label: 'Сетка',
						isChecked: state.isChecked,
						onUpdateChecked: (value: boolean) => {
							state.isChecked = value
						},
					},
				],
			}),
			template: '<BaseDropdownMenu :items="items()" is-open><button type="button">Вид</button></BaseDropdownMenu>',
		})
		render(Host, { global: { stubs: { Transition: false } } })
		const item = await screen.findByRole('menuitemcheckbox', { name: 'Сетка' })
		const check = () => item.querySelector('.base-dropdown-menu__indicator > *')

		await fireEvent.click(item)
		const shown = check()
		expect(shown).toHaveClass('base-dropdown-menu-check-enter-active')

		await fireEvent.click(item)
		expect(shown).toHaveClass('base-dropdown-menu-check-leave-active')
		await waitFor(() => expect(check()).toBeNull())
	})
})
