import '@testing-library/jest-dom/vitest'
import BaseTransfer from '../ui/BaseTransfer.vue'
import userEvent from '@testing-library/user-event'
import type { ListItem } from '@components/BaseList'
import { defineComponent, h, nextTick, ref } from 'vue'
import { render, screen, within } from '@testing-library/vue'

const ITEMS: ListItem[] = [
	{ id: 'a', title: 'Анна' },
	{ id: 'b', title: 'Борис' },
	{ id: 'c', title: 'Вера' },
]

function renderTransfer(initial: string[] = [], props: Record<string, unknown> = {}) {
	const value = ref<string[]>(initial)
	const onChange = vi.fn()
	const Host = defineComponent({
		setup: () => () =>
			h(BaseTransfer, {
				items: ITEMS,
				modelValue: value.value,
				'onUpdate:modelValue': (next: string[]) => (value.value = next),
				onChange,
				...props,
			}),
	})
	render(Host)
	return { value, onChange, user: userEvent.setup() }
}

const listbox = (name: string): HTMLElement => screen.getByRole('listbox', { name })
const option = (name: string, title: string): HTMLElement => within(listbox(name)).getByRole('option', { name: title })
const ids = (name: string): string[] =>
	within(listbox(name))
		.getAllByRole('option')
		.map(item => item.dataset.listId ?? '')
const settle = async (): Promise<void> => {
	await nextTick()
	await nextTick()
	await nextTick()
}

describe('BaseTransfer integration', () => {
	it('Space отмечает, Ctrl + → переносит, фокус остаётся в «Доступно» на том же месте', async () => {
		const { value, onChange, user } = renderTransfer()
		await user.tab()
		expect(screen.getAllByRole('checkbox', { name: 'Выбрать все' })[0]).toHaveFocus()
		await user.tab()
		expect(option('Доступно', 'Анна')).toHaveFocus()
		await user.keyboard(' ')
		await user.keyboard('{Control>}{ArrowRight}{/Control}')
		await settle()
		expect(value.value).toEqual(['a'])
		expect(onChange).toHaveBeenCalledWith({ to: 'target', ids: ['a'] })
		expect(option('Доступно', 'Борис')).toHaveFocus()
	})

	it('Alt + → тоже переносит; перенос с последнего места — фокус на предыдущую строку', async () => {
		const { value, user } = renderTransfer()
		option('Доступно', 'Вера').focus()
		await user.keyboard(' {Alt>}{ArrowRight}{/Alt}')
		await settle()
		expect(value.value).toEqual(['c'])
		expect(option('Доступно', 'Борис')).toHaveFocus()
	})

	it('последняя строка ушла — фокус на неё в «Выбрано»', async () => {
		const { value, user } = renderTransfer(['a', 'b'])
		option('Доступно', 'Вера').focus()
		await user.keyboard(' {Control>}{ArrowRight}{/Control}')
		await settle()
		expect(value.value).toEqual(['a', 'b', 'c'])
		expect(option('Выбрано', 'Вера')).toHaveFocus()
	})

	it('Ctrl + ← возвращает из «Выбрано»; стрелка в свою сторону и без модификатора — ничего', async () => {
		const { value, user } = renderTransfer(['a', 'b'])
		option('Выбрано', 'Анна').focus()
		await user.keyboard(' {Control>}{ArrowRight}{/Control}{ArrowRight}{Shift>}{ArrowLeft}{/Shift}')
		expect(value.value).toEqual(['a', 'b'])
		await user.keyboard('{Control>}{ArrowLeft}{/Control}')
		await settle()
		expect(value.value).toEqual(['b'])
		expect(ids('Доступно')).toEqual(['a', 'c'])
		expect(option('Выбрано', 'Борис')).toHaveFocus()
	})

	it('Ctrl + → без отмеченных — ничего', async () => {
		const { value, onChange, user } = renderTransfer()
		option('Доступно', 'Борис').focus()
		await user.keyboard('{Control>}{ArrowRight}{/Control}')
		expect(value.value).toEqual([])
		expect(onChange).not.toHaveBeenCalled()
		expect(option('Доступно', 'Борис')).toHaveFocus()
	})

	it('Ctrl + A отмечает все, затем перенос кнопкой — фокус на первую перенесённую в «Выбрано»', async () => {
		const { value, user } = renderTransfer()
		option('Доступно', 'Анна').focus()
		await user.keyboard('{Control>}a{/Control}')
		await user.click(screen.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' }))
		await settle()
		expect(value.value).toEqual(['a', 'b', 'c'])
		expect(option('Выбрано', 'Анна')).toHaveFocus()
		expect(within(screen.getByRole('group', { name: 'Доступно' })).getByText('Список пуст')).toBeInTheDocument()
	})

	it('перенесённую строку скрыл поиск — фокус на первую строку исходной панели', async () => {
		const { value, user } = renderTransfer(['c'], { isSearchable: true })
		await user.type(screen.getByRole('textbox', { name: 'Поиск: Выбрано' }), 'ве')
		await user.click(option('Доступно', 'Анна'))
		await user.click(screen.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' }))
		await settle()
		expect(value.value).toEqual(['c', 'a'])
		expect(option('Доступно', 'Борис')).toHaveFocus()
	})

	it('перенесённую строку скрыл поиск и исходная панель пуста — фокус не переводится', async () => {
		const { value, user } = renderTransfer(['b', 'c'], { isSearchable: true })
		await user.type(screen.getByRole('textbox', { name: 'Поиск: Выбрано' }), 'ве')
		await user.click(option('Доступно', 'Анна'))
		const button = screen.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' })
		await user.click(button)
		await settle()
		expect(value.value).toEqual(['b', 'c', 'a'])
		expect(document.activeElement?.closest('[role="listbox"]')).toBeNull()
	})

	it('isSortable: Alt + ↓ в «Выбрано» меняет порядок v-model, «Доступно» не переставляется', async () => {
		const { value, user } = renderTransfer(['a', 'b'], { isSortable: true })
		option('Выбрано', 'Анна').focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		expect(value.value).toEqual(['b', 'a'])
		option('Доступно', 'Вера').focus()
		await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
		expect(ids('Доступно')).toEqual(['c'])
	})

	it('isDisabled: клавиши не переносят', async () => {
		const { value, user } = renderTransfer([], { isDisabled: true })
		option('Доступно', 'Анна').focus()
		await user.keyboard(' {Control>}{ArrowRight}{/Control}')
		expect(value.value).toEqual([])
	})
})
