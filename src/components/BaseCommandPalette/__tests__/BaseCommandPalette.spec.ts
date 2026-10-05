import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { defineComponent, nextTick, ref } from 'vue'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import type { CommandItem } from '../types/BaseCommandPalette.types'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const run = vi.fn()

const COMMANDS: CommandItem[] = [
	{ id: 'home', label: 'Главная', group: 'Навигация', icon: 'home', shortcut: 'mod+h' },
	{ id: 'tasks', label: 'Задачи', group: 'Навигация', description: 'Доска и список' },
	{ id: 'export', label: 'Экспорт', group: 'Действия', isDisabled: true },
	{ id: 'theme', label: 'Тема', group: 'Вид', onSelect: run },
]

const ctrlK = () => fireEvent.keyDown(window, { key: 'k', code: 'KeyK', ctrlKey: true })

const dialog = () => screen.getByRole('dialog', { name: 'Палитра команд' })

const search = () => within(dialog()).getByRole('combobox', { name: 'Поиск команды' })

const option = (name: RegExp) => within(dialog()).getByRole('option', { name })

describe('BaseCommandPalette', () => {
	afterEach(() => {
		setLocale('ru')
		run.mockClear()
	})

	it('Ctrl+K открывает и закрывает; группы, значки, сочетания, пояснения и первая команда выбрана', async () => {
		const { emitted } = render(BaseCommandPalette, { props: { commands: COMMANDS } })

		expect(screen.queryByRole('dialog')).toBeNull()
		await ctrlK()
		expect(emitted('update:isOpen')).toEqual([[true]])
		expect(within(dialog()).getByRole('group', { name: 'Навигация' })).toBeInTheDocument()
		expect(search()).toHaveAttribute('aria-activedescendant', option(/Главная/).id)
		expect(option(/Главная/)).toHaveAttribute('aria-selected', 'true')
		expect(option(/Задачи/)).toHaveTextContent('Доска и список')
		expect(option(/Экспорт/)).toHaveAttribute('aria-disabled', 'true')
		expect(option(/Главная/).querySelectorAll('.base-kbd')).toHaveLength(2)
		await ctrlK()
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
	})

	it('поиск, стрелки с пропуском недоступных, Home и End; Enter выполняет команду', async () => {
		const { emitted } = render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true } })

		await fireEvent.keyDown(search(), { key: 'ArrowDown' })
		expect(option(/Задачи/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(search(), { key: 'ArrowDown' })
		expect(option(/Тема/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(search(), { key: 'ArrowDown' })
		expect(option(/Главная/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(search(), { key: 'ArrowUp' })
		await fireEvent.keyDown(search(), { key: 'Home' })
		expect(option(/Главная/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(search(), { key: 'End' })
		expect(option(/Тема/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(search(), { key: 'x' })
		await fireEvent.keyDown(search(), { key: 'ArrowDown', isComposing: true })
		expect(option(/Тема/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.update(search(), 'зад')
		expect(within(dialog()).getAllByRole('option')).toHaveLength(1)
		expect(option(/Задачи/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.update(search(), 'тема')
		await fireEvent.keyDown(search(), { key: 'Enter' })
		expect(emitted('select')).toEqual([[COMMANDS[3]]])
		expect(run).toHaveBeenCalledOnce()
		expect(emitted('update:isOpen')).toEqual([[false]])
	})

	it('мышь: наведение выбирает, клик выполняет; недоступная команда не выбирается и не выполняется', async () => {
		const { emitted } = render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true } })

		await fireEvent.mouseMove(option(/Экспорт/))
		expect(option(/Главная/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.click(option(/Экспорт/))
		expect(emitted('select')).toBeUndefined()
		await fireEvent.mouseMove(option(/Задачи/))
		expect(option(/Задачи/)).toHaveAttribute('aria-selected', 'true')
		await fireEvent.click(option(/Задачи/))
		expect(emitted('select')).toEqual([[COMMANDS[1]]])
	})

	it('без команд — «Ничего не найдено»', () => {
		render(BaseCommandPalette, { props: { commands: [], isOpen: true } })

		expect(within(dialog()).getByText('Ничего не найдено')).toBeInTheDocument()
		expect(within(dialog()).queryAllByRole('option')).toHaveLength(0)
	})

	it('ничего не найдено: текст и слот empty; Enter без команд ничего не делает', async () => {
		const { emitted, rerender } = render(BaseCommandPalette, {
			props: { commands: COMMANDS, isOpen: true },
			slots: { empty: '<template #empty="{ query }">Нет «{{ query }}»</template>' },
		})

		await fireEvent.update(search(), 'ракета')
		expect(within(dialog()).getByText('Нет «ракета»')).toBeInTheDocument()
		await fireEvent.keyDown(search(), { key: 'Enter' })
		expect(emitted('select')).toBeUndefined()
		await rerender({ isOpen: false })
		await rerender({ isOpen: true })
		expect(search()).toHaveValue('')
	})

	it('своё сочетание и null, Escape закрывает, слот command, язык и оформление', async () => {
		setLocale('en')
		const { emitted, rerender } = render(BaseCommandPalette, {
			props: {
				commands: COMMANDS,
				hotkey: 'mod+p',
				placeholder: 'Команда',
				ariaLabel: 'Команды',
				variant: 'shadow',
				customClass: { root: 'r', input: 'i', option: 'o' },
			},
			slots: { command: '<template #command="{ command, isActive }">{{ command.label }}:{{ isActive }}</template>' },
		})

		await ctrlK()
		expect(screen.queryByRole('dialog')).toBeNull()
		await fireEvent.keyDown(window, { key: 'p', code: 'KeyP', ctrlKey: true })
		const palette = screen.getByRole('dialog', { name: 'Команды' })
		expect(within(palette).getByRole('combobox', { name: 'Search commands' })).toHaveAttribute('placeholder', 'Команда')
		expect(within(palette).getByRole('option', { name: 'Главная:true' })).toHaveClass('o')
		expect(document.querySelector('.base-command-palette')).toHaveClass('base-modal--shadow', 'r')
		await fireEvent.keyDown(within(palette).getByRole('combobox'), { key: 'Escape' })
		await waitFor(() => expect(emitted('update:isOpen')).toEqual([[true], [false]]))
		await rerender({ hotkey: null })
		await fireEvent.keyDown(window, { key: 'p', code: 'KeyP', ctrlKey: true })
		expect(emitted('update:isOpen')).toHaveLength(2)
	})

	it('hotkeyScope="container": сочетание только при фокусе внутри блока палитры; global — на всей странице', async () => {
		const scope = ref<'container' | 'global'>('container')
		render(
			defineComponent({
				components: { BaseCommandPalette },
				setup: () => ({ scope, commands: COMMANDS }),
				template: `
					<div>
						<input aria-label="Снаружи" />
						<section><input aria-label="Внутри" /><BaseCommandPalette :commands="commands" :hotkey-scope="scope" /></section>
					</div>
				`,
			}),
		)
		const press = (target: Element | Window) => fireEvent.keyDown(target, { key: 'k', code: 'KeyK', ctrlKey: true })

		await press(window)
		await press(screen.getByRole('textbox', { name: 'Снаружи' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		await press(screen.getByRole('textbox', { name: 'Внутри' }))
		expect(dialog()).toBeInTheDocument()
		await fireEvent.keyDown(search(), { key: 'Escape' })
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		scope.value = 'global'
		await nextTick()
		await press(screen.getByRole('textbox', { name: 'Снаружи' }))
		expect(dialog()).toBeInTheDocument()
	})
})
