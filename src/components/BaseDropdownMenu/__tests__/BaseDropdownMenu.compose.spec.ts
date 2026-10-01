import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { DropdownMenuItem, DropdownMenuItems } from '../types/BaseDropdownMenu.types'

function renderMenu(items: DropdownMenuItems, props: Record<string, unknown> = {}) {
	render(BaseDropdownMenu, {
		props: { items, ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Действия') },
	})
	return screen.getByRole('button', { name: 'Действия' })
}

async function openMenu(trigger: HTMLElement): Promise<HTMLElement> {
	trigger.focus()
	await fireEvent.keyDown(trigger, { key: 'Enter' })
	await nextTick()
	return screen.getByRole('menu')
}

function focused(): string | undefined {
	return document.activeElement?.textContent?.trim()
}

const GROUPS: DropdownMenuItem[][] = [
	[{ label: 'Открыть' }, { type: 'separator' }, { label: 'Сохранить' }],
	[{ label: 'Печать' }],
	[{ label: 'Удалить' }, { type: 'separator' }, { label: 'Выход' }],
]

describe('BaseDropdownMenu — разделители из BaseSeparator', () => {
	it('число разделителей = (групп − 1) + пунктов-разделителей', async () => {
		await openMenu(renderMenu(GROUPS))

		expect(screen.getAllByRole('separator')).toHaveLength(2 + 2)
	})

	it('одна группа без пунктов-разделителей — разделителей нет', async () => {
		await openMenu(renderMenu([{ label: 'Один' }, { label: 'Два' }]))

		expect(screen.queryAllByRole('separator')).toHaveLength(0)
	})

	it('разделитель — BaseSeparator с прежним классом и ключом customClass.separator', async () => {
		await openMenu(renderMenu(GROUPS, { customClass: { separator: 'my-separator' } }))
		const separators = screen.getAllByRole('separator')

		for (const separator of separators) {
			expect(separator).toHaveClass('base-separator', 'base-dropdown-menu__separator', 'my-separator')
			expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
			expect(separator).not.toHaveAttribute('tabindex')
		}
	})

	it('стрелки пропускают разделители: фокус только на пунктах меню', async () => {
		const menu = await openMenu(renderMenu(GROUPS))
		const visited: (string | undefined)[] = [focused()]

		for (let step = 0; step < 5; step++) {
			await fireEvent.keyDown(menu, { key: 'ArrowDown' })
			visited.push(focused())
			expect(document.activeElement).toHaveAttribute('role', 'menuitem')
		}
		expect(visited).toEqual(['Открыть', 'Сохранить', 'Печать', 'Удалить', 'Выход', 'Открыть'])
		await fireEvent.keyDown(menu, { key: 'ArrowUp' })
		expect(focused()).toBe('Выход')
	})

	it('разделители во вложенном меню тоже BaseSeparator с customClass.separator', async () => {
		const menu = await openMenu(
			renderMenu([{ label: 'Ещё', children: [{ label: 'А' }, { type: 'separator' }, { label: 'Б' }] }], {
				customClass: { separator: 'my-separator' },
			}),
		)
		await fireEvent.keyDown(menu, { key: 'ArrowRight' })
		await nextTick()

		const separator = await screen.findByRole('separator')
		expect(separator).toHaveClass('base-separator', 'base-dropdown-menu__separator', 'my-separator')
	})
})
