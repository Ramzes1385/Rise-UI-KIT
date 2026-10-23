import '@testing-library/jest-dom/vitest'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import type { CommandItem } from '../types/BaseCommandPalette.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const COMMANDS: CommandItem[] = [
	{ id: 'home', label: 'ホーム' },
	{ id: 'tasks', label: 'タスク' },
]

describe('BaseCommandPalette: ввод через IME', () => {
	it('Safari: стрелки и Enter с keyCode 229 принадлежат IME, команда не выполняется', async () => {
		const { emitted } = render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true } })
		const search = within(screen.getByRole('dialog', { name: 'Палитра команд' })).getByRole('combobox', { name: 'Поиск команды' })
		const firstId = search.getAttribute('aria-activedescendant')

		await fireEvent.keyDown(search, { key: 'ArrowDown', keyCode: 229 })
		expect(search).toHaveAttribute('aria-activedescendant', firstId)
		await fireEvent.keyDown(search, { key: 'Enter', keyCode: 229 })
		expect(emitted('select')).toBeUndefined()

		await fireEvent.keyDown(search, { key: 'Enter', keyCode: 13 })
		expect(emitted('select')).toHaveLength(1)
	})
})
