import '@testing-library/jest-dom/vitest'
import BaseGantt from '../ui/BaseGantt.vue'
import { createUiKitPlugin } from '@/plugin'
import { DATE, day, TASKS, TODAY } from './fixtures'
import { render, screen } from '@testing-library/vue'
import type { BaseGanttProps } from '../types/BaseGantt.types'

function renderGantt(props: Partial<BaseGanttProps> = {}, options: Record<string, unknown> = {}) {
	return render(BaseGantt, { props: { tasks: TASKS, today: TODAY, ...props }, ...options })
}

const rowOf = (name: string): HTMLElement => screen.getByText(name).closest('[role="row"]') as HTMLElement

describe('BaseGantt', () => {
	it('рисует дерево задач как treegrid с именем и числом строк', () => {
		renderGantt()
		const grid = screen.getByRole('treegrid', { name: 'Диаграмма Ганта' })
		expect(grid).toHaveAttribute('aria-rowcount', '6')
		expect(screen.getAllByRole('row')).toHaveLength(6)
		expect(screen.getByRole('columnheader', { name: 'Задача' })).toBeInTheDocument()
		expect(screen.getByRole('columnheader', { name: 'Шкала времени' })).toBeInTheDocument()
	})

	it('использует ariaLabel вместо имени из словаря', () => {
		renderGantt({ ariaLabel: 'План проекта' })
		expect(screen.getByRole('treegrid', { name: 'План проекта' })).toBeInTheDocument()
	})

	it('размечает уровни, позиции и раскрытость строк', () => {
		renderGantt()
		const project = rowOf('Проект')
		expect(project).toHaveAttribute('aria-level', '1')
		expect(project).toHaveAttribute('aria-expanded', 'true')
		expect(project).toHaveAttribute('aria-posinset', '1')
		expect(project).toHaveAttribute('aria-setsize', '2')
		expect(project).toHaveAttribute('aria-rowindex', '2')
		const child = rowOf('Разработка')
		expect(child).toHaveAttribute('aria-level', '2')
		expect(child).toHaveAttribute('aria-posinset', '2')
		expect(child).toHaveAttribute('aria-setsize', '3')
		expect(child).not.toHaveAttribute('aria-expanded')
	})

	it('даёт полосам доступные имена по шаблону «имя: начало — конец, прогресс %»', () => {
		renderGantt()
		const name = `Анализ: ${DATE.format(day(5))} — ${DATE.format(day(9))}, 100 %`
		expect(screen.getByRole('button', { name })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: `Релиз: ${DATE.format(day(23))}, веха` })).toBeInTheDocument()
	})

	it('ширина и сдвиг полосы считаются от дней: 36 px на день при шкале day', () => {
		renderGantt({ scale: 'day' })
		const bar = screen.getByRole('button', { name: /^Анализ/ })
		expect(bar.style.width).toBe('180px')
		const next = screen.getByRole('button', { name: /^Разработка/ })
		expect(parseFloat(next.style.left) - parseFloat(bar.style.left)).toBe(7 * 36)
	})

	it('columnWidth меняет масштаб шкалы', () => {
		renderGantt({ scale: 'day', columnWidth: 20 })
		expect(screen.getByRole('button', { name: /^Анализ/ }).style.width).toBe('100px')
	})

	it('заливка прогресса — процент ширины полосы', () => {
		const { container } = renderGantt()
		const fills = [...container.querySelectorAll<HTMLElement>('.base-gantt__progress')].map(element => element.style.width)
		expect(fills).toContain('100%')
		expect(fills).toContain('30%')
	})

	it('ограничивает прогресс диапазоном 0–100', () => {
		const { container } = renderGantt({
			tasks: [
				{ id: 1, name: 'А', start: '2026-10-01', progress: 150 },
				{ id: 2, name: 'Б', start: '2026-10-02', progress: -5 },
				{ id: 3, name: 'В', start: '2026-10-03', progress: Number.NaN },
			],
		})
		expect([...container.querySelectorAll<HTMLElement>('.base-gantt__progress')].map(element => element.style.width)).toEqual([
			'100%',
			'0%',
			'0%',
		])
	})

	it('рисует линию «сегодня» внутри шкалы и скрывает её по isTodayVisible=false или вне шкалы', () => {
		const { container, rerender } = renderGantt()
		expect(container.querySelector('.base-gantt__today')).toBeInTheDocument()
		rerender({ tasks: TASKS, today: TODAY, isTodayVisible: false })
		return Promise.resolve().then(async () => {
			expect(container.querySelector('.base-gantt__today')).not.toBeInTheDocument()
			await rerender({ tasks: TASKS, today: '2030-01-01', isTodayVisible: true })
			expect(container.querySelector('.base-gantt__today')).not.toBeInTheDocument()
		})
	})

	it('без today берёт текущий день', () => {
		const { container } = render(BaseGantt, {
			props: { tasks: [{ id: 1, name: 'Сегодня', start: new Date(), end: new Date() }] },
		})
		expect(container.querySelector('.base-gantt__today')).toBeInTheDocument()
	})

	it('рисует стрелки зависимостей одним контуром и наконечники отдельно', () => {
		const { container } = renderGantt()
		expect(container.querySelector('.base-gantt__arrow-lines')?.getAttribute('d')).toMatch(/^M\d/)
		expect(container.querySelector('.base-gantt__arrow-heads')?.getAttribute('d')).toContain('z')
	})

	it('подписи шкалы: месяцы сверху, начало недели снизу', () => {
		const { container } = renderGantt()
		expect([...container.querySelectorAll('.base-gantt__scale-cell--top')].map(cell => cell.textContent).join('|')).toContain(
			'Октябрь 2026',
		)
		expect(container.querySelectorAll('.base-gantt__scale-cell--bottom').length).toBeGreaterThan(3)
	})

	it('шкала month подписывает годы и месяцы', () => {
		const { container } = renderGantt({ scale: 'month' })
		expect(container.querySelector('.base-gantt__scale-cell--top')?.textContent).toContain('2026')
		expect(container.querySelector('.base-gantt__scale-cell--bottom')?.textContent).toMatch(/[А-Яа-я]/)
	})

	it('шкала day подписывает дни', () => {
		const { container } = renderGantt({ scale: 'day' })
		expect(container.querySelectorAll('.base-gantt__scale-cell--bottom')[1]?.textContent?.trim()).toMatch(/^\d+$/)
	})

	it('слот name заменяет название и получает задачу, уровень и свёрнутость', () => {
		render(BaseGantt, {
			props: { tasks: TASKS, today: TODAY },
			slots: { name: `<template #name="{ task, level, isCollapsed }">{{ task.name }}|{{ level }}|{{ isCollapsed }}</template>` },
		})
		expect(screen.getByText('Анализ|1|false')).toBeInTheDocument()
	})

	it('без задач показывает пустое состояние, слот empty его заменяет', () => {
		const { unmount } = renderGantt({ tasks: [] })
		expect(screen.getByText('Нет задач')).toBeInTheDocument()
		expect(screen.queryByRole('treegrid')).not.toBeInTheDocument()
		unmount()
		render(BaseGantt, { props: { tasks: [] }, slots: { empty: 'Добавьте первую задачу' } })
		expect(screen.getByText('Добавьте первую задачу')).toBeInTheDocument()
	})

	it('при isLoading показывает скелетон со статусом загрузки', () => {
		const { container } = renderGantt({ isLoading: true })
		expect(screen.getByRole('status', { name: 'Загрузка задач' })).toHaveAttribute('aria-busy', 'true')
		expect(container.querySelector('.base-skeleton')).toBeInTheDocument()
		expect(screen.queryByRole('treegrid')).not.toBeInTheDocument()
	})

	it('при isDisabled помечает таблицу и убирает строки из табуляции', () => {
		const { container } = renderGantt({ isDisabled: true })
		expect(screen.getByRole('treegrid')).toHaveAttribute('aria-disabled', 'true')
		expect(container.querySelectorAll('[role="row"][tabindex="0"]')).toHaveLength(0)
		expect(container.querySelector('.base-gantt')).toHaveClass('base-gantt--disabled')
	})

	it('в таблицу попадает ровно одна строка с tabindex=0', () => {
		const { container } = renderGantt()
		expect(container.querySelectorAll('[role="row"][tabindex="0"]')).toHaveLength(1)
		expect(rowOf('Проект')).toHaveAttribute('tabindex', '0')
	})

	it('подсказка по клавишам есть только у редактируемой диаграммы и связана с полосой', () => {
		const { container, unmount } = renderGantt()
		expect(container.querySelector('.base-gantt__hint')).not.toBeInTheDocument()
		unmount()
		renderGantt({ isEditable: true })
		const hint = document.querySelector('.base-gantt__hint') as HTMLElement
		expect(hint).toHaveTextContent('Стрелки сдвигают задачу')
		expect(screen.getByRole('button', { name: /^Анализ/ })).toHaveAttribute('aria-describedby', hint.id)
	})

	it('у редактируемой диаграммы есть ручки краёв, у вехи нет', () => {
		const { container } = renderGantt({ isEditable: true })
		expect(container.querySelectorAll('.base-gantt__handle--start')).toHaveLength(4)
		expect(container.querySelectorAll('.base-gantt__handle--end')).toHaveLength(4)
	})

	it('живой регион есть сразу и пуст', () => {
		renderGantt()
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('добавляет модификатор варианта, customClass и ui', () => {
		const { container } = renderGantt({
			variant: 'soft',
			customClass: { root: 'my-root' },
			ui: { bar: 'my-bar', row: 'my-row', milestone: 'my-mile' },
		})
		const root = container.querySelector('.base-gantt')
		expect(root).toHaveClass('base-gantt--soft', 'my-root')
		expect(container.querySelector('.base-gantt__bar')).toHaveClass('my-bar')
		expect(container.querySelector('.base-gantt__milestone')).toHaveClass('my-mile')
		expect(container.querySelector('[role="row"][data-row-index]')).toHaveClass('my-row')
	})

	it('пишет --size-scale и пересчитывает размеры при sizeScale', () => {
		const { container } = renderGantt({ sizeScale: 125, scale: 'day' })
		const root = container.querySelector('.base-gantt') as HTMLElement
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.style.getPropertyValue('--gantt-row-height')).toBe('45px')
		expect(screen.getByRole('button', { name: /^Анализ/ }).style.width).toBe('225px')
	})

	it('height: число — px, строка — CSS-длина', () => {
		const { container, rerender } = renderGantt({ height: 300 })
		expect((container.querySelector('.base-gantt') as HTMLElement).style.height).toBe('300px')
		return rerender({ tasks: TASKS, today: TODAY, height: '50vh' }).then(() => {
			expect((container.querySelector('.base-gantt') as HTMLElement).style.height).toBe('50vh')
		})
	})

	it('dateFormat меняет формат дат в подписях', () => {
		renderGantt({ dateFormat: { day: '2-digit', month: '2-digit' } })
		expect(screen.getByRole('button', { name: 'Анализ: 05.10 — 09.10, 100 %' })).toBeInTheDocument()
	})

	it('значения по умолчанию можно переопределить настройками плагина', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseGantt: { scale: 'day', isTodayVisible: false } } })
		const { container } = render(BaseGantt, { props: { tasks: TASKS, today: TODAY }, global: { plugins: [plugin] } })
		expect(screen.getByRole('button', { name: /^Анализ/ }).style.width).toBe('180px')
		expect(container.querySelector('.base-gantt__today')).not.toBeInTheDocument()
	})
})
