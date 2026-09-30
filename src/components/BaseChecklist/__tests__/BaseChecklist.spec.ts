import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseChecklist from '../ui/BaseChecklist.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { ChecklistItem } from '../types/BaseChecklist.types'

const ITEMS: ChecklistItem[] = [
	{ id: 'a', title: 'Установить', description: 'npm install' },
	{ id: 'b', title: 'Подключить', actionLabel: 'Инструкция' },
	{ id: 'c', title: 'Настроить', description: 'Тема', actionLabel: 'Открыть' },
]

const checkbox = (name: string) => screen.getByRole('checkbox', { name })

describe('BaseChecklist', () => {
	afterEach(() => setLocale('ru'))

	it('заголовок, прогресс, следующий шаг и пояснения', () => {
		const { container } = render(BaseChecklist, { props: { items: ITEMS, completed: ['a'] } })

		expect(screen.getByRole('group', { name: 'Первые шаги' })).toBeInTheDocument()
		expect(screen.getByText('1 из 3')).toBeInTheDocument()
		expect(screen.getByRole('progressbar', { name: 'Выполнено шагов' })).toHaveAttribute('aria-valuetext', '1 из 3')
		expect(checkbox('Установить')).toBeChecked()
		expect(checkbox('Установить')).toHaveAccessibleDescription('npm install')
		expect(checkbox('Подключить')).toHaveAccessibleDescription('Следующий шаг')
		expect(checkbox('Настроить')).toHaveAccessibleDescription('Тема')
		expect(container.querySelector('.base-checklist__item--next')).toHaveTextContent('Подключить')
		expect(screen.getByRole('button', { name: 'Инструкция' })).not.toHaveClass('base-button--outline')
		expect(screen.getByRole('button', { name: 'Открыть' })).toHaveClass('base-button--outline')
		expect(screen.queryByRole('status')).toBeNull()
	})

	it('флажок отмечает и снимает шаг; кнопка — событие action', async () => {
		const { emitted } = render(BaseChecklist, { props: { items: ITEMS, title: 'Запуск' } })

		expect(screen.getByRole('group', { name: 'Запуск' })).toBeInTheDocument()
		await fireEvent.click(checkbox('Подключить'))
		await fireEvent.click(checkbox('Установить'))
		await fireEvent.click(checkbox('Подключить'))
		expect(emitted('update:completed')).toEqual([[['b']], [['b', 'a']], [['a']]])
		expect(checkbox('Подключить')).toHaveAccessibleDescription('Следующий шаг')
		await fireEvent.click(screen.getByRole('button', { name: 'Инструкция' }))
		expect(emitted('action')).toEqual([[ITEMS[1]]])
	})

	it('всё выполнено — «Всё готово» и слот done; v-model снаружи', async () => {
		const { rerender, container } = render(BaseChecklist, { props: { items: ITEMS, completed: ['a', 'b', 'c'] } })

		expect(screen.getByRole('status')).toHaveTextContent('Всё готово')
		expect(screen.queryByRole('button')).toBeNull()
		expect(container.querySelector('.base-checklist')).toHaveClass('base-checklist--complete')
		await rerender({ completed: undefined })
		expect(screen.queryByRole('status')).toBeNull()
		expect(screen.getByText('0 из 3')).toBeInTheDocument()
		await rerender({ items: [] })
		expect(screen.queryByRole('status')).toBeNull()
	})

	it('слот done, is-disabled, язык, вариант, масштаб и customClass', () => {
		setLocale('en')
		const { container } = render(BaseChecklist, {
			props: {
				items: ITEMS,
				completed: ['a', 'b', 'c'],
				isDisabled: true,
				variant: 'soft',
				sizeScale: 125,
				customClass: { root: 'r', item: 'i' },
			},
			slots: { done: 'Готово к запуску' },
		})
		const root = container.querySelector('.base-checklist') as HTMLElement

		expect(screen.getByRole('group', { name: 'Getting started' })).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent('Готово к запуску')
		expect(checkbox('Установить')).toBeDisabled()
		expect(root).toHaveClass('base-checklist--soft', 'base-checklist--disabled', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-checklist__item')).toHaveClass('i')
	})
})
