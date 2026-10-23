import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseKanban from '../ui/BaseKanban.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { KANBAN_PARTS, type KanbanCard, type KanbanColumn } from '../types/BaseKanban.types'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План', color: 'var(--rise-primary)' },
	{ id: 'done', title: 'Готово' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа', description: 'Описание', key: 'R-1', labels: [{ text: 'чат' }], coverColor: 'red' },
]

const UI = Object.fromEntries(['root', ...KANBAN_PARTS].map(part => [part, `u-${part}`]))

const global = { stubs: { TransitionGroup: false } }

describe('BaseKanban: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseKanban, {
			props: { columns: COLUMNS, cards: CARDS, isCollapsible: true, isEditable: true },
			global,
		})

		expect(container.querySelector('.base-kanban__board')).toHaveAttribute('class', 'base-kanban__board')
		expect(container.querySelector('.base-kanban__title')).toHaveAttribute('class', 'base-kanban__title')
		expect(container.querySelector('.base-kanban__list')).toHaveAttribute('class', 'base-kanban__list')
		expect(container.querySelector('.base-kanban__card-title')).toHaveAttribute('class', 'base-kanban__card-title')
		expect(container.querySelector('.base-kanban')).toHaveClass('base-kanban')
		expect(container.querySelector('.base-kanban')?.className).not.toMatch(/u-/)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseKanban, {
			props: {
				columns: COLUMNS,
				cards: CARDS,
				isCollapsible: true,
				isEditable: true,
				variant: 'soft',
				customClass: { root: 'own-root', card: 'own-card' },
				ui: UI,
			},
			global,
		})

		expect(container.querySelector('.base-kanban')).toHaveClass('u-root', 'base-kanban--soft', 'own-root')
		expect(container.querySelector('.base-kanban__card')).toHaveClass('u-card', 'own-card')
		expect(container.querySelector('.base-kanban__column')).toHaveClass('u-column', 'base-kanban__column--colored')
		const present = ['board', 'header', 'dot', 'title', 'count', 'toggle', 'list', 'item', 'cover', 'labels', 'card-title']
		for (const part of [...present, 'card-description', 'meta', 'empty', 'add']) {
			expect(container.querySelector(`.base-kanban__${part}`), part).toHaveClass(`u-${part}`)
		}
		await fireEvent.click(screen.getAllByRole('button', { name: 'Добавить карточку' })[0])
		expect(container.querySelector('.base-kanban__editor')).toHaveClass('u-editor')
		expect(container.querySelector('.base-kanban__field')).toHaveClass('u-field')
	})

	it('копия под курсором получает класс части ghost', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, ui: { ghost: 'u-ghost' } }, global })
		const pointer = (type: string, x: number) => new PointerEvent(type, { bubbles: true, clientX: x, clientY: 10, button: 0 })

		screen.getByRole('button', { name: 'Альфа' }).dispatchEvent(pointer('pointerdown', 10))
		await fireEvent(window, pointer('pointermove', 60))

		expect(document.querySelector('.base-kanban__ghost')).toHaveClass('u-ghost')
		await fireEvent.keyDown(window, { key: 'Escape' })
	})

	it('классы из defaults.BaseKanban.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseKanban, {
			props: { columns: COLUMNS, cards: CARDS, ui: { card: 'own-card' } },
			global: {
				...global,
				plugins: [createUiKitPlugin({ defaults: { BaseKanban: { ui: { root: 'app-root', card: 'app-card' } } } })],
			},
		})

		expect(container.querySelector('.base-kanban')).toHaveClass('app-root')
		expect(container.querySelector('.base-kanban__card')).toHaveClass('base-kanban__card', 'app-card', 'own-card')
	})
})
