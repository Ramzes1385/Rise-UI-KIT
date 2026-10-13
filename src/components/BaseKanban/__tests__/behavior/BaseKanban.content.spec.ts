import '@testing-library/jest-dom/vitest'
import { config } from '@vue/test-utils'
import { setLocale } from '@/locales/state'
import BaseKanban from '../../ui/BaseKanban.vue'
import { render, screen } from '@testing-library/vue'
import type { KanbanCard, KanbanColumn } from '../../types/BaseKanban.types'

config.global.stubs = { ...config.global.stubs, 'transition-group': false }

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'done', title: 'Готово', isDone: true },
]

const RICH: KanbanCard = {
	id: 'r1',
	columnId: 'todo',
	key: 'RISE-7',
	title: 'Тёмная тема',
	description: 'Токены',
	labels: [{ text: 'дизайн', color: 'info' }, { text: 'без цвета' }],
	tags: ['ui'],
	priority: 'highest',
	dueDate: '2025-05-12',
	subtasks: { done: 2, total: 5 },
	comments: 3,
	attachments: 1,
	estimate: 5,
	assignees: [{ name: 'Анна Смирнова', avatar: '/anna.png' }, { name: 'Иван Петров' }],
	coverColor: 'rgb(1, 2, 3)',
}

const TODAY = '2025-05-15'

const card = (name: string) => screen.getByRole('button', { name })

describe('BaseKanban: содержимое карточки', () => {
	afterEach(() => setLocale('ru'))

	it('обложка, метки, номер, приоритет, срок, счётчики, оценка и исполнители', () => {
		const { container } = render(BaseKanban, { props: { columns: COLUMNS, cards: [RICH], today: TODAY } })
		const element = card('Тёмная тема')

		expect(element.querySelector('.base-kanban__cover')).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' })
		expect([...element.querySelectorAll('.base-kanban__label')].map(label => [label.textContent?.trim(), label.className])).toEqual([
			['дизайн', 'base-badge base-badge--soft base-badge--status-info base-kanban__label base-kanban__label--info'],
			['без цвета', 'base-badge base-badge--soft base-badge--status-neutral base-kanban__label base-kanban__label--neutral'],
			['ui', 'base-badge base-badge--soft base-badge--status-neutral base-kanban__label base-kanban__label--neutral'],
		])
		expect(element.querySelector('.base-kanban__key')).toHaveTextContent('RISE-7')
		expect(element.querySelector('.base-kanban__priority--highest')?.closest('.base-tooltip')).not.toBeNull()
		expect(element.querySelectorAll('.base-kanban__priority .base-icon')).toHaveLength(2)
		expect(element.querySelector('.base-kanban__due--overdue')).toHaveTextContent('12 мая')
		expect(element.querySelector('.base-kanban__stat')).toHaveTextContent('2/5')
		expect(element.querySelector('.base-kanban__estimate')).toHaveTextContent('5')
		expect(container.querySelector('.base-kanban__meta')).toHaveAttribute('aria-hidden', 'true')
		expect(element).toHaveAccessibleDescription(
			[
				'RISE-7. Метки: дизайн, без цвета, ui. Приоритет: самый высокий. Срок: 12 мая, просрочен. Подзадачи: 2 из 5.',
				'3 комментария. 1 вложение. Оценка: 5. Исполнители: Анна Смирнова, Иван Петров. Токены',
				'Space — взять карточку, стрелки — перейти к соседней, Enter — открыть',
			].join(' '),
		)
	})

	it('срок: сегодня, завтра, позже и в колонке завершённых; обложка-картинка; без полей — без строки данных', () => {
		const cards: KanbanCard[] = [
			{ id: 'a', columnId: 'todo', title: 'Сегодня', dueDate: new Date(2025, 4, 15, 18), subtasks: { done: 3, total: 3 } },
			{ id: 'b', columnId: 'todo', title: 'Завтра', dueDate: '2025-05-16', coverImage: '/cover.png' },
			{ id: 'c', columnId: 'todo', title: 'Позже', dueDate: '2025-06-01', priority: 'medium' },
			{ id: 'd', columnId: 'done', title: 'Готово', dueDate: '2025-05-01' },
			{ id: 'e', columnId: 'todo', title: 'Пустая' },
		]
		render(BaseKanban, { props: { columns: COLUMNS, cards, today: new Date(2025, 4, 15, 9) } })

		expect(card('Сегодня').querySelector('.base-kanban__due--today')).toHaveTextContent('Сегодня')
		expect(card('Сегодня')).toHaveAccessibleDescription(/^Срок: сегодня\. Подзадачи: 3 из 3 /)
		expect(card('Сегодня').querySelector('.base-kanban__stat--complete')).toBeInTheDocument()
		expect(card('Завтра').querySelector('.base-kanban__due--tomorrow')).toHaveTextContent('Завтра')
		expect(card('Завтра')).toHaveAccessibleDescription(/^Срок: завтра /)
		expect(card('Завтра').querySelector('.base-kanban__cover--image')).toHaveStyle({ backgroundImage: 'url("/cover.png")' })
		expect(card('Позже').querySelector('.base-kanban__due--later')).toHaveTextContent('1 июн')
		expect(card('Позже')).toHaveAccessibleDescription(/^Приоритет: средний\. Срок: 1 июня /)
		expect(card('Готово').querySelector('.base-kanban__due--done')).toBeInTheDocument()
		expect(card('Готово')).toHaveAccessibleDescription(/^Срок: 1 мая /)
		expect(card('Пустая').querySelector('.base-kanban__meta')).toBeNull()
		expect(card('Пустая').querySelector('.base-kanban__cover')).toBeNull()
	})

	it('по умолчанию сегодня — текущая дата; английский язык', () => {
		setLocale('en')
		render(BaseKanban, { props: { columns: COLUMNS, cards: [{ ...RICH, dueDate: new Date(), comments: 1, attachments: 2 }] } })

		expect(card('Тёмная тема').querySelector('.base-kanban__due--today')).toHaveTextContent('Today')
		expect(card('Тёмная тема')).toHaveAccessibleDescription(
			/Priority: highest\. Due today\. Subtasks: 2 of 5\. 1 comment\. 2 attachments\./,
		)
	})
})
