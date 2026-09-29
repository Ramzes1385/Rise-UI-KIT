import '@testing-library/jest-dom/vitest'
import BaseMention from '../ui/BaseMention.vue'
import type { MentionOption } from '../types/BaseMention.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const TEAM: MentionOption[] = [
	{ value: 'anna', label: 'Анна Смирнова', description: 'Дизайн', avatar: '/anna.png' },
	{ value: 'ivan', label: 'Иван Петров' },
	{ value: 'fedor', label: 'Фёдор Ильин' },
]

async function typeAt(field: HTMLTextAreaElement, value: string): Promise<void> {
	field.focus()
	await fireEvent.update(field, value)
	field.setSelectionRange(value.length, value.length)
	await fireEvent.keyUp(field, { key: value.at(-1) })
}

describe('BaseMention', () => {
	it('поле с подписью, ошибкой и ARIA автодополнения; без триггера список закрыт', () => {
		render(BaseMention, { props: { label: 'Комментарий', error: 'Нужно упоминание', options: TEAM } })
		const field = screen.getByRole('textbox', { name: 'Комментарий' })

		expect(field).toHaveAttribute('aria-autocomplete', 'list')
		expect(field).toHaveAttribute('rows', '3')
		expect(field).toHaveAttribute('aria-invalid', 'true')
		expect(field).toHaveAccessibleDescription('Нужно упоминание')
		expect(field).not.toHaveAttribute('aria-controls')
		expect(screen.queryByRole('listbox')).toBeNull()
	})

	it('@ открывает список, фильтр по имени и нику без учёта регистра и ё; событие search', async () => {
		const { emitted } = render(BaseMention, { props: { options: TEAM, label: 'Текст' } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement

		await typeAt(field, 'Привет, @')
		expect(screen.getAllByRole('option')).toHaveLength(3)
		expect(field).toHaveAttribute('aria-controls', screen.getByRole('listbox', { name: 'Упоминания' }).id)
		expect(field).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id)
		await typeAt(field, 'Привет, @ФЕД')
		expect(screen.getByRole('option')).toHaveTextContent('Фёдор Ильин@fedor')
		await typeAt(field, 'Привет, @iv')
		expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Иван Петров')
		expect(emitted('search')).toEqual([[''], ['ФЕД'], ['iv']])
	})

	it('аватар или первая буква имени, описание', async () => {
		const { container } = render(BaseMention, { props: { options: TEAM } })

		await typeAt(screen.getByRole('textbox') as HTMLTextAreaElement, '@')
		expect(container.querySelector('img.base-mention__avatar')).toHaveAttribute('src', '/anna.png')
		expect(container.querySelector('.base-mention__avatar--initial')).toHaveTextContent('И')
		expect(container.querySelector('.base-mention__option-description')).toHaveTextContent('Дизайн')
	})

	it('стрелки выбирают по кругу, Enter вставляет @ник и пробел, событие mention', async () => {
		const { emitted } = render(BaseMention, { props: { options: TEAM } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement

		await typeAt(field, 'См. @')
		await fireEvent.keyDown(field, { key: 'ArrowUp' })
		expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
		await fireEvent.keyDown(field, { key: 'ArrowDown' })
		await fireEvent.keyDown(field, { key: 'ArrowDown' })
		await fireEvent.keyDown(field, { key: 'Enter' })
		expect(field).toHaveValue('См. @ivan ')
		expect(emitted('mention')).toEqual([[TEAM[1]]])
		expect(emitted('update:modelValue')?.at(-1)).toEqual(['См. @ivan '])
		expect(screen.queryByRole('listbox')).toBeNull()
		await new Promise(resolve => setTimeout(resolve))
		expect(field.selectionStart).toBe('См. @ivan '.length)
	})

	it('Tab и клик тоже вставляют; перед готовым пробелом второй не добавляется', async () => {
		render(BaseMention, { props: { options: TEAM, trigger: '#' } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement

		await fireEvent.update(field, '#an текст')
		field.setSelectionRange(3, 3)
		await fireEvent.click(field)
		await fireEvent.keyDown(field, { key: 'Tab' })
		expect(field).toHaveValue('#anna текст')
		await typeAt(field, '#anna текст #')
		const option = screen.getAllByRole('option')[2]
		await fireEvent.mouseDown(option)
		await fireEvent.click(option)
		expect(field).toHaveValue('#anna текст #fedor ')
	})

	it('Escape закрывает список до следующего упоминания; blur закрывает', async () => {
		render(BaseMention, { props: { options: TEAM } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement

		await typeAt(field, '@а')
		await fireEvent.keyDown(field, { key: 'Escape' })
		await fireEvent.keyUp(field, { key: 'Escape' })
		expect(screen.queryByRole('listbox')).toBeNull()
		await typeAt(field, '@ан')
		expect(screen.queryByRole('listbox')).toBeNull()
		await typeAt(field, '@ан ')
		await typeAt(field, '@ан @')
		expect(screen.getByRole('listbox')).toBeInTheDocument()
		await fireEvent.blur(field)
		expect(screen.queryByRole('listbox')).toBeNull()
	})

	it('ничего не нашлось — сообщение; Enter без вариантов и другие клавиши не перехватываются', async () => {
		render(BaseMention, { props: { options: TEAM } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement
		const isPassed = (key: string, init: KeyboardEventInit = {}): boolean =>
			field.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init }))

		await typeAt(field, '@zz')
		expect(screen.getByRole('status')).toHaveTextContent('Никого не нашлось')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		expect(isPassed('Enter')).toBe(true)
		await typeAt(field, 'текст')
		expect(isPassed('ArrowDown')).toBe(true)
		await typeAt(field, '@')
		expect(isPassed('a')).toBe(true)
		expect(isPassed('Enter', { isComposing: true })).toBe(true)
		expect(isPassed('ArrowDown')).toBe(false)
	})

	it('v-model снаружи; без options — пусто', async () => {
		const { rerender } = render(BaseMention, { props: { modelValue: '@anna привет' } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement

		expect(field).toHaveValue('@anna привет')
		await rerender({ modelValue: undefined })
		expect(field).toHaveValue('')
		await typeAt(field, '@')
		expect(screen.getByRole('status')).toHaveTextContent('Никого не нашлось')
	})

	it('max-suggestions ограничивает список; is-disabled отключает поле', async () => {
		const { container } = render(BaseMention, { props: { options: TEAM, maxSuggestions: 2, isDisabled: true } })

		expect(screen.getByRole('textbox')).toBeDisabled()
		expect(container.querySelector('.base-mention')).toHaveClass('base-mention--disabled')
		await typeAt(screen.getByRole('textbox') as HTMLTextAreaElement, '@')
		expect(screen.getAllByRole('option')).toHaveLength(2)
	})

	it('вариант, масштаб и customClass', async () => {
		const { container } = render(BaseMention, {
			props: {
				options: TEAM,
				label: 'Текст',
				error: 'Ошибка',
				variant: 'outline',
				sizeScale: 125,
				customClass: { root: 'r', label: 'l', control: 'c', list: 'li', error: 'e' },
			},
		})
		const root = container.querySelector('.base-mention') as HTMLElement

		expect(root).toHaveClass('base-mention--outline', 'base-mention--error', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('label')).toHaveClass('l')
		expect(container.querySelector('textarea')).toHaveClass('c')
		expect(container.querySelector('.base-mention__error')).toHaveClass('e')
		await typeAt(screen.getByRole('textbox') as HTMLTextAreaElement, '@')
		expect(container.querySelector('.base-mention__popup')).toHaveClass('li')
	})
})
