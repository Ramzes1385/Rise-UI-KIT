import '@testing-library/jest-dom/vitest'
import BaseGantt from '../ui/BaseGantt.vue'
import userEvent from '@testing-library/user-event'
import { DATE, day, TASKS, TODAY } from './fixtures'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseGanttProps, GanttTask, GanttTaskChange } from '../types/BaseGantt.types'

function renderGantt(props: Partial<BaseGanttProps> = {}) {
	return render(BaseGantt, { props: { tasks: TASKS, today: TODAY, scale: 'day', ...props } })
}

const rowOf = (name: string): HTMLElement => screen.getByText(name).closest('[role="row"]') as HTMLElement
const barOf = (name: RegExp): HTMLElement => screen.getByRole('button', { name })
const status = (): string => screen.getByRole('status').textContent ?? ''
const taskEvents = (emitted: Record<string, unknown[][]>): GanttTask[] => (emitted['update:task'] ?? []).map(([task]) => task as GanttTask)
const clicks = (emitted: Record<string, unknown[][]>): GanttTask[] => (emitted['task-click'] ?? []).map(([task]) => task as GanttTask)
const changeEvents = (emitted: Record<string, unknown[][]>): GanttTaskChange[] =>
	(emitted['task-change'] ?? []).map(([change]) => change as GanttTaskChange)

function mockScroller(container: Element, clientHeight: number): HTMLElement {
	const scroller = container.querySelector('.base-gantt__viewport') as HTMLElement
	let scrollTop = 0
	Object.defineProperty(scroller, 'scrollTop', { configurable: true, get: () => scrollTop, set: (value: number) => (scrollTop = value) })
	Object.defineProperty(scroller, 'clientHeight', { configurable: true, get: () => clientHeight })
	return scroller
}

const MANY: GanttTask[] = Array.from({ length: 500 }, (_, index) => ({
	id: index,
	name: `Задача ${index}`,
	start: `2026-10-${String((index % 20) + 1).padStart(2, '0')}`,
	end: `2026-10-${String((index % 20) + 3).padStart(2, '0')}`,
}))

const renderedRows = (container: Element): number => container.querySelectorAll('[role="row"][data-row-index]').length

describe('BaseGantt — клавиатура по строкам', () => {
	it('Tab ставит фокус на первую строку, стрелки вниз и вверх двигают его', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		expect(rowOf('Проект')).toHaveFocus()
		await user.keyboard('{ArrowDown}')
		await waitFor(() => expect(rowOf('Анализ')).toHaveFocus())
		expect(rowOf('Анализ')).toHaveAttribute('tabindex', '0')
		expect(rowOf('Проект')).toHaveAttribute('tabindex', '-1')
		await user.keyboard('{ArrowUp}')
		await waitFor(() => expect(rowOf('Проект')).toHaveFocus())
		await user.keyboard('{ArrowUp}')
		await waitFor(() => expect(rowOf('Проект')).toHaveFocus())
	})

	it('Home и End переходят к первой и последней строке', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		await user.keyboard('{End}')
		await waitFor(() => expect(rowOf('Аудит')).toHaveFocus())
		await user.keyboard('{ArrowDown}')
		await waitFor(() => expect(rowOf('Аудит')).toHaveFocus())
		await user.keyboard('{Home}')
		await waitFor(() => expect(rowOf('Проект')).toHaveFocus())
	})

	it('Стрелка влево сворачивает развёрнутую задачу, вправо разворачивает', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt()
		await user.tab()
		await user.keyboard('{ArrowLeft}')
		await waitFor(() => expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'false'))
		expect(screen.queryByText('Анализ')).not.toBeInTheDocument()
		expect(screen.getByRole('treegrid')).toHaveAttribute('aria-rowcount', '3')
		expect(emitted()['update:collapsedIds']).toEqual([[['project']]])
		await user.keyboard('{ArrowRight}')
		await waitFor(() => expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'true'))
		expect(screen.getByText('Анализ')).toBeInTheDocument()
		expect(emitted()['update:collapsedIds']?.[1]).toEqual([[]])
	})

	it('Enter и пробел переключают раскрытие задачи с детьми', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		await user.keyboard('{Enter}')
		await waitFor(() => expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'false'))
		await user.keyboard(' ')
		await waitFor(() => expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'true'))
	})

	it('Стрелка влево на дочерней строке возвращает к родителю, на верхнем уровне — ничего', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		await user.keyboard('{ArrowDown}')
		await waitFor(() => expect(rowOf('Анализ')).toHaveFocus())
		await user.keyboard('{ArrowLeft}')
		await waitFor(() => expect(rowOf('Проект')).toHaveFocus())
		await user.keyboard('{End}')
		await waitFor(() => expect(rowOf('Аудит')).toHaveFocus())
		await user.keyboard('{ArrowLeft}')
		expect(rowOf('Аудит')).toHaveFocus()
	})

	it('Enter на задаче без детей сообщает task-click', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt()
		await user.tab()
		await user.keyboard('{ArrowDown}{Enter}')
		await waitFor(() => expect(emitted()['task-click']).toHaveLength(1))
		expect(clicks(emitted()).map(task => task.id)).toEqual(['analysis'])
	})

	it('Стрелка вправо на строке без детей переходит на полосу, влево возвращает', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		await user.keyboard('{ArrowDown}{ArrowRight}')
		await waitFor(() => expect(barOf(/^Анализ/)).toHaveFocus())
		await user.keyboard('{ArrowLeft}')
		await waitFor(() => expect(rowOf('Анализ')).toHaveFocus())
	})

	it('Стрелка вправо на развёрнутой родительской строке переходит на её полосу', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		await user.keyboard('{ArrowRight}')
		await waitFor(() => expect(barOf(/^Проект/)).toHaveFocus())
	})

	it('на полосе: Escape, стрелки вверх и вниз, Home и End, Enter и пробел', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt()
		await user.tab()
		await user.keyboard('{ArrowDown}{ArrowRight}')
		await waitFor(() => expect(barOf(/^Анализ/)).toHaveFocus())
		await user.keyboard('{ArrowDown}')
		await waitFor(() => expect(barOf(/^Разработка/)).toHaveFocus())
		await user.keyboard('{ArrowUp}')
		await waitFor(() => expect(barOf(/^Анализ/)).toHaveFocus())
		await user.keyboard('{End}')
		await waitFor(() => expect(barOf(/^Аудит/)).toHaveFocus())
		await user.keyboard('{Home}')
		await waitFor(() => expect(barOf(/^Проект/)).toHaveFocus())
		await user.keyboard('{Enter}')
		await user.keyboard(' ')
		expect(emitted()['task-click']).toHaveLength(2)
		await user.keyboard('{Escape}')
		await waitFor(() => expect(rowOf('Проект')).toHaveFocus())
	})

	it('другие клавиши не перехватываются', async () => {
		const user = userEvent.setup()
		renderGantt()
		await user.tab()
		const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
		rowOf('Проект').dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
		const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		rowOf('Проект').dispatchEvent(arrow)
		expect(arrow.defaultPrevented).toBe(true)
	})

	it('при isDisabled клавиши ничего не делают', async () => {
		renderGantt({ isDisabled: true, isEditable: true })
		await fireEvent.keyDown(rowOf('Проект'), { key: 'ArrowDown' })
		await fireEvent.keyDown(barOf(/^Анализ/), { key: 'ArrowRight' })
		expect(rowOf('Анализ')).not.toHaveFocus()
		expect(screen.getByRole('status')).toHaveTextContent('')
	})
})

describe('BaseGantt — клики и свёртка', () => {
	it('клик по полосе и по названию сообщает task-click с задачей', async () => {
		const { emitted } = renderGantt()
		await fireEvent.click(barOf(/^Анализ/))
		await fireEvent.click(screen.getByText('Аудит'))
		expect(clicks(emitted()).map(task => task.id)).toEqual(['analysis', 'audit'])
	})

	it('при isDisabled клики и стрелка раскрытия не работают', async () => {
		const { emitted, container } = renderGantt({ isDisabled: true })
		await fireEvent.click(barOf(/^Анализ/))
		await fireEvent.click(screen.getByText('Аудит'))
		await fireEvent.click(container.querySelector('.base-gantt__toggle') as HTMLElement)
		expect(emitted()['task-click']).toBeUndefined()
		expect(emitted()['update:collapsedIds']).toBeUndefined()
	})

	it('клик по стрелке в названии сворачивает и разворачивает без task-click', async () => {
		const { emitted, container } = renderGantt()
		const toggle = container.querySelector('.base-gantt__toggle') as HTMLElement
		await fireEvent.click(toggle)
		expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'false')
		await fireEvent.click(toggle)
		expect(rowOf('Проект')).toHaveAttribute('aria-expanded', 'true')
		expect(emitted()['task-click']).toBeUndefined()
		expect(emitted()['update:collapsedIds']).toHaveLength(2)
	})

	it('collapsedIds сворачивает задачи и следует за изменением пропа', async () => {
		const { rerender } = renderGantt({ collapsedIds: ['project'] })
		expect(screen.queryByText('Анализ')).not.toBeInTheDocument()
		await rerender({ tasks: TASKS, today: TODAY, scale: 'day', collapsedIds: [] })
		expect(screen.getByText('Анализ')).toBeInTheDocument()
	})

	it('свёрнутый родитель сохраняет полосу, а стрелки скрытых задач не рисуются', async () => {
		const { container } = renderGantt({ collapsedIds: ['project'] })
		expect(barOf(/^Проект/)).toBeInTheDocument()
		expect(container.querySelector('.base-gantt__arrow-lines')?.getAttribute('d')).toBe('')
	})

	it('тип связи: стрелки всех четырёх типов рисуются, описание связи — через aria-describedby', () => {
		const tasks: GanttTask[] = [
			{ id: 'a', name: 'Первая', start: '2026-10-05', end: '2026-10-08' },
			{ id: 'b', name: 'Вторая', start: '2026-10-09', end: '2026-10-12' },
			{
				id: 'c',
				name: 'Третья',
				start: '2026-10-13',
				end: '2026-10-14',
				dependencies: ['a', { id: 'b', type: 'SS' }, { id: 'a', type: 'FF' }],
			},
			{
				id: 'd',
				name: 'Четвёртая',
				start: '2026-10-15',
				dependencies: [
					{ id: 'c', type: 'SF' },
					{ id: 'b', type: 'FF' },
				],
			},
		]
		const { container } = renderGantt({ tasks })

		const lines = container.querySelector('.base-gantt__arrow-lines')?.getAttribute('d') ?? ''
		expect(lines.match(/M/g)).toHaveLength(4)
		const bar = barOf(/^Третья/)
		const description = document.getElementById(bar.getAttribute('aria-describedby') as string)
		expect(description).toHaveTextContent('Зависит от: «Первая» (окончание — начало), «Вторая» (начало — начало)')
		expect(barOf(/^Первая/)).not.toHaveAttribute('aria-describedby')
		expect(document.getElementById(barOf(/^Четвёртая/).getAttribute('aria-describedby') as string)).toHaveTextContent(
			'«Третья» (начало — окончание), «Вторая» (окончание — окончание)',
		)
	})

	it('описание связи идёт после подсказки правки', () => {
		const tasks: GanttTask[] = [
			{ id: 'a', name: 'Первая', start: '2026-10-05' },
			{ id: 'b', name: 'Вторая', start: '2026-10-09', dependencies: ['a'] },
		]
		renderGantt({ tasks, isEditable: true })

		expect(
			barOf(/^Вторая/)
				.getAttribute('aria-describedby')
				?.split(' '),
		).toHaveLength(2)
		expect(
			barOf(/^Первая/)
				.getAttribute('aria-describedby')
				?.split(' '),
		).toHaveLength(1)
	})
})

describe('BaseGantt — зависимости', () => {
	it('стрелка к скрытой свёрнутой задаче не рисуется', () => {
		const tasks: GanttTask[] = [
			{ id: 'g', name: 'Группа', start: '2026-10-05', end: '2026-10-08' },
			{ id: 'c', name: 'Внутри', start: '2026-10-05', end: '2026-10-06', parentId: 'g' },
			{ id: 'x', name: 'После', start: '2026-10-09', dependencies: ['c'] },
		]
		const { container } = renderGantt({ tasks, collapsedIds: ['g'] })
		expect(container.querySelector('.base-gantt__arrow-lines')?.getAttribute('d')).toBe('')
	})
})

describe('BaseGantt — правка с клавиатуры', () => {
	it('стрелки на полосе сдвигают задачу на шаг шкалы и сообщают об этом', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		barOf(/^Анализ/).focus()
		await user.keyboard('{ArrowRight}')
		expect(taskEvents(emitted())).toEqual([{ ...TASKS[1], start: '2026-10-06', end: '2026-10-10' }])
		expect(changeEvents(emitted())[0]).toMatchObject({ kind: 'move', source: 'keyboard', previous: TASKS[1] })
		expect(status()).toBe(`Задача «Анализ» перенесена: ${DATE.format(day(6))} — ${DATE.format(day(10))}`)
		await user.keyboard('{ArrowLeft}{ArrowLeft}')
		expect(taskEvents(emitted()).at(-1)).toMatchObject({ start: '2026-10-04', end: '2026-10-08' })
	})

	it('шаг шкалы week — неделя, month — календарный месяц', async () => {
		const user = userEvent.setup()
		const { emitted, rerender } = renderGantt({ isEditable: true, scale: 'week' })
		barOf(/^Анализ/).focus()
		await user.keyboard('{ArrowRight}')
		expect(taskEvents(emitted())[0]).toMatchObject({ start: '2026-10-12', end: '2026-10-16' })
		await rerender({ tasks: TASKS, today: TODAY, isEditable: true, scale: 'month' })
		barOf(/^Анализ/).focus()
		await user.keyboard('{ArrowRight}')
		expect(taskEvents(emitted())[1]).toMatchObject({ start: '2026-11-05', end: '2026-11-09' })
	})

	it('Shift со стрелками меняет длительность и озвучивает её со склонением', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		barOf(/^Анализ/).focus()
		await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
		expect(changeEvents(emitted())[0]).toMatchObject({ kind: 'resize-end', task: { start: '2026-10-05', end: '2026-10-10' } })
		expect(status()).toBe(`Длительность задачи «Анализ»: 6 дней, ${DATE.format(day(5))} — ${DATE.format(day(10))}`)
	})

	it('длительность не опускается ниже одного дня и тогда события нет', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ tasks: [{ id: 1, name: 'Один', start: '2026-10-05' }], isEditable: true })
		barOf(/^Один/).focus()
		await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
		expect(emitted()['update:task']).toBeUndefined()
	})

	it('веху можно только сдвигать', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		barOf(/^Релиз/).focus()
		await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
		expect(taskEvents(emitted())[0]).toMatchObject({ id: 'release', start: '2026-10-24' })
		expect(taskEvents(emitted())[0].end).toBeUndefined()
		expect(status()).toBe(`Веха «Релиз» перенесена: ${DATE.format(day(24))}`)
	})

	it('Date в задаче остаются Date', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		barOf(/^Аудит/).focus()
		await user.keyboard('{ArrowRight}')
		const task = taskEvents(emitted())[0]
		expect(task.start).toEqual(day(27))
		expect(task.end).toEqual(day(29))
	})

	it('без isEditable стрелки не меняют даты, влево возвращает к строке', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt()
		barOf(/^Анализ/).focus()
		await user.keyboard('{ArrowRight}')
		expect(emitted()['update:task']).toBeUndefined()
		await user.keyboard('{ArrowLeft}')
		await waitFor(() => expect(rowOf('Анализ')).toHaveFocus())
	})
})

describe('BaseGantt — перетаскивание мышью', () => {
	const press = (target: Element, x: number, init: Record<string, unknown> = {}): Promise<void> =>
		fireEvent.pointerDown(target, { button: 0, clientX: x, pointerId: 1, pointerType: 'mouse', ...init })

	it('перетаскивание полосы сдвигает обе даты на целые дни и сообщает при отпускании', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		const left = parseFloat(bar.style.left)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		expect(bar).toHaveClass('base-gantt__bar--dragging')
		expect(parseFloat(bar.style.left)).toBe(left + 72)
		expect(emitted()['update:task']).toBeUndefined()
		await fireEvent.pointerMove(bar, { clientX: 172 })
		await fireEvent.pointerUp(bar, { clientX: 172 })
		expect(bar).not.toHaveClass('base-gantt__bar--dragging')
		expect(taskEvents(emitted())).toEqual([{ ...TASKS[1], start: '2026-10-07', end: '2026-10-11' }])
		expect(changeEvents(emitted())[0]).toMatchObject({ kind: 'move', source: 'pointer' })
		expect(status()).toContain('перенесена')
	})

	it('стрелки зависимостей следуют за черновиком', async () => {
		const { container } = renderGantt({ isEditable: true })
		const lines = (): string => container.querySelector('.base-gantt__arrow-lines')?.getAttribute('d') ?? ''
		const before = lines()
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 136 })
		expect(lines()).not.toBe(before)
	})

	it('край полосы меняет длительность: правый — окончание, левый — начало', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar.querySelector('.base-gantt__handle--end') as Element, 200)
		await fireEvent.pointerMove(bar, { clientX: 236 })
		await fireEvent.pointerUp(bar)
		await press(bar.querySelector('.base-gantt__handle--start') as Element, 100)
		await fireEvent.pointerMove(bar, { clientX: 64 })
		await fireEvent.pointerUp(bar)
		expect(changeEvents(emitted()).map(change => [change.kind, change.task.start, change.task.end])).toEqual([
			['resize-end', '2026-10-05', '2026-10-10'],
			['resize-start', '2026-10-04', '2026-10-09'],
		])
		expect(status()).toContain('Длительность')
	})

	it('сдвиг меньше порога — это клик: task-click есть, изменения нет', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 101 })
		await fireEvent.pointerUp(bar)
		await fireEvent.click(bar)
		expect(emitted()['update:task']).toBeUndefined()
		expect(emitted()['task-click']).toHaveLength(1)
	})

	it('после перетаскивания следующий click не считается нажатием', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		await fireEvent.pointerUp(bar)
		await fireEvent.click(bar)
		expect(emitted()['task-click']).toBeUndefined()
		await fireEvent.click(bar)
		expect(emitted()['task-click']).toHaveLength(1)
	})

	it('возврат на исходное место отпускает без изменения', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		await fireEvent.pointerMove(bar, { clientX: 100 })
		await fireEvent.pointerUp(bar)
		expect(emitted()['update:task']).toBeUndefined()
	})

	it('pointercancel и Escape отменяют перетаскивание', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		await fireEvent.pointerCancel(bar)
		await fireEvent.pointerUp(bar)
		expect(bar).not.toHaveClass('base-gantt__bar--dragging')
		await user.click(bar)
		expect(clicks(emitted())).toHaveLength(1)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		bar.focus()
		await user.keyboard('{Escape}')
		expect(bar).not.toHaveClass('base-gantt__bar--dragging')
		await fireEvent.pointerUp(bar)
		expect(emitted()['update:task']).toBeUndefined()
	})

	it('Escape во время перетаскивания подавляет следующий click по полосе, а Escape без сдвига — нет', async () => {
		const user = userEvent.setup()
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await press(bar, 100)
		await fireEvent.pointerMove(bar, { clientX: 172 })
		bar.focus()
		await user.keyboard('{Escape}')
		await fireEvent.pointerUp(bar)
		await fireEvent.click(bar)
		expect(emitted()['task-click']).toBeUndefined()
		await fireEvent.click(bar)
		expect(emitted()['task-click']).toHaveLength(1)

		await press(bar, 100)
		await user.keyboard('{Escape}')
		await fireEvent.click(bar)
		expect(emitted()['task-click']).toHaveLength(2)
	})

	it('движение и отпускание без нажатия ничего не делают', async () => {
		const { emitted } = renderGantt({ isEditable: true })
		const bar = barOf(/^Анализ/)
		await fireEvent.pointerMove(bar, { clientX: 300 })
		await fireEvent.pointerUp(bar)
		expect(emitted()['update:task']).toBeUndefined()
	})

	it('не редактирует без isEditable, при isDisabled и другой кнопкой мыши', async () => {
		const first = renderGantt()
		await press(barOf(/^Анализ/), 100)
		await fireEvent.pointerMove(barOf(/^Анализ/), { clientX: 172 })
		await fireEvent.pointerUp(barOf(/^Анализ/))
		expect(first.emitted()['update:task']).toBeUndefined()
		first.unmount()

		const second = renderGantt({ isEditable: true, isDisabled: true })
		await press(barOf(/^Анализ/), 100)
		await fireEvent.pointerMove(barOf(/^Анализ/), { clientX: 172 })
		await fireEvent.pointerUp(barOf(/^Анализ/))
		expect(second.emitted()['update:task']).toBeUndefined()
		second.unmount()

		const third = renderGantt({ isEditable: true })
		await press(barOf(/^Анализ/), 100, { button: 2 })
		await fireEvent.pointerMove(barOf(/^Анализ/), { clientX: 172 })
		await fireEvent.pointerUp(barOf(/^Анализ/))
		expect(third.emitted()['update:task']).toBeUndefined()
	})

	it('размонтирование во время перетаскивания снимает слушатели окна', async () => {
		const { emitted, unmount } = renderGantt({ isEditable: true })
		await press(barOf(/^Анализ/), 100)
		unmount()
		await fireEvent.pointerMove(window, { clientX: 300 })
		await fireEvent.pointerUp(window)
		expect(emitted()['update:task']).toBeUndefined()
	})
})

describe('BaseGantt — много задач', () => {
	it('отрисовывает только окно строк и размечает полное число строк', () => {
		const { container } = renderGantt({ tasks: MANY })
		expect(screen.getByRole('treegrid')).toHaveAttribute('aria-rowcount', '501')
		expect(renderedRows(container)).toBeLessThan(40)
		expect(screen.queryByText('Задача 400')).not.toBeInTheDocument()
	})

	it('прокрутка сдвигает окно строк', async () => {
		const { container } = renderGantt({ tasks: MANY })
		const scroller = mockScroller(container, 400)
		scroller.scrollTop = 3600
		await fireEvent.scroll(scroller)
		await waitFor(() => expect(screen.getByText('Задача 100')).toBeInTheDocument())
		expect(screen.queryByText('Задача 1')).not.toBeInTheDocument()
		expect(rowOf('Задача 100')).toHaveAttribute('aria-rowindex', '102')
		expect(rowOf('Задача 100').style.top).toBe(`${48 + 100 * 36}px`)
	})

	it('строка с фокусом остаётся в DOM после прокрутки', async () => {
		const user = userEvent.setup()
		const { container } = renderGantt({ tasks: MANY })
		const scroller = mockScroller(container, 400)
		await user.tab()
		scroller.scrollTop = 9000
		await fireEvent.scroll(scroller)
		await waitFor(() => expect(screen.getByText('Задача 250')).toBeInTheDocument())
		expect(screen.getByText('Задача 0')).toBeInTheDocument()
	})

	it('End прокручивает к последней строке и фокусирует её', async () => {
		const user = userEvent.setup()
		const { container } = renderGantt({ tasks: MANY })
		const scroller = mockScroller(container, 448)
		await user.tab()
		await user.keyboard('{End}')
		await waitFor(() => expect(rowOf('Задача 499')).toHaveFocus())
		expect(scroller.scrollTop).toBe(500 * 36 - 400)
		await user.keyboard('{Home}')
		await waitFor(() => expect(rowOf('Задача 0')).toHaveFocus())
		expect(scroller.scrollTop).toBe(0)
	})

	it('строка внутри окна прокрутку не меняет', async () => {
		const user = userEvent.setup()
		const { container } = renderGantt({ tasks: MANY })
		const scroller = mockScroller(container, 448)
		await user.tab()
		await user.keyboard('{ArrowDown}')
		await waitFor(() => expect(rowOf('Задача 1')).toHaveFocus())
		expect(scroller.scrollTop).toBe(0)
	})

	it('следит за размером области через ResizeObserver', async () => {
		const observe = vi.fn()
		const disconnect = vi.fn()
		let notify: () => void = () => undefined
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: () => void) {
					notify = callback
				}
				observe = observe
				disconnect = disconnect
			},
		)
		const { container, unmount } = renderGantt({ tasks: MANY })
		await waitFor(() => expect(observe).toHaveBeenCalledTimes(1))
		const before = renderedRows(container)
		mockScroller(container, 1500)
		notify()
		await waitFor(() => expect(renderedRows(container)).toBeGreaterThan(before))
		unmount()
		expect(disconnect).toHaveBeenCalled()
		vi.unstubAllGlobals()
	})

	it('наблюдатель размера переподключается, когда список появляется после загрузки', async () => {
		const observe = vi.fn()
		const disconnect = vi.fn()
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe = observe
				disconnect = disconnect
			},
		)
		const { rerender } = renderGantt({ isLoading: true })
		expect(observe).not.toHaveBeenCalled()
		await rerender({ tasks: TASKS, today: TODAY, scale: 'day', isLoading: false })
		await waitFor(() => expect(observe).toHaveBeenCalledTimes(1))
		await rerender({ tasks: TASKS, today: TODAY, scale: 'day', isLoading: true })
		await waitFor(() => expect(disconnect).toHaveBeenCalled())
		vi.unstubAllGlobals()
	})

	it('при сдвиге начала диапазона компенсирует горизонтальную прокрутку', async () => {
		const { container, rerender } = renderGantt()
		const scroller = container.querySelector('.base-gantt__viewport') as HTMLElement
		scroller.scrollLeft = 100
		const earlier: GanttTask[] = [{ id: 'early', name: 'Раньше', start: '2026-09-01', end: '2026-09-02' }, ...TASKS]
		await rerender({ tasks: earlier, today: TODAY, scale: 'day' })
		await waitFor(() => expect(scroller.scrollLeft).toBeGreaterThan(100))
	})

	it('при смене шкалы прокрутка не компенсируется', async () => {
		const { container, rerender } = renderGantt()
		const scroller = container.querySelector('.base-gantt__viewport') as HTMLElement
		scroller.scrollLeft = 100
		await rerender({ tasks: TASKS, today: TODAY, scale: 'month' })
		expect(scroller.scrollLeft).toBe(100)
	})
})
