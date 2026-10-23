import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import type { DropdownMenuItem } from '../types/BaseDropdownMenu.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const ITEMS: DropdownMenuItem[] = [
	{ label: 'Переименовать' },
	{ label: 'Скачать', children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }] },
]

async function openMenu(): Promise<HTMLElement> {
	render(BaseDropdownMenu, { props: { items: ITEMS }, slots: { default: () => h('button', { type: 'button' }, 'Действия') } })
	const trigger = screen.getByRole('button', { name: 'Действия' })
	trigger.focus()
	await fireEvent.keyDown(trigger, { key: 'Enter' })
	await nextTick()
	return screen.getByRole('menu')
}

describe('BaseDropdownMenu в RTL', () => {
	beforeEach(() => document.documentElement.setAttribute('dir', 'rtl'))
	afterEach(() => {
		document.documentElement.removeAttribute('dir')
		document.body.innerHTML = ''
	})

	it('← открывает подменю, → закрывает и возвращает фокус; ArrowRight на родителе подменю не открывает', async () => {
		const menu = await openMenu()
		const download = within(menu).getByRole('menuitem', { name: 'Скачать' })
		download.focus()

		await fireEvent.keyDown(menu, { key: 'ArrowRight' })
		expect(download).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.keyDown(menu, { key: 'ArrowLeft' })
		await nextTick()
		expect(download).toHaveAttribute('aria-expanded', 'true')
		const submenu = screen.getByRole('menu', { name: 'Скачать' })
		expect(document.activeElement?.textContent?.trim()).toBe('Видео MP4')

		await fireEvent.keyDown(submenu, { key: 'ArrowRight' })
		expect(screen.queryByRole('menu', { name: 'Скачать' })).not.toBeInTheDocument()
		expect(download).toHaveFocus()
	})

	it('подменю открывается влево: точка роста справа сверху', async () => {
		const menu = await openMenu()
		const download = within(menu).getByRole('menuitem', { name: 'Скачать' })
		download.focus()
		await fireEvent.keyDown(menu, { key: 'ArrowLeft' })
		await nextTick()

		const panel = screen.getByRole('menu', { name: 'Скачать' }).closest('.base-dropdown__panel') as HTMLElement
		expect(panel.style.transformOrigin).toBe('top right')
	})
})
