import { setLocale } from '@/locales/state'
import { normalizeTasks } from '../../model/tasks/ganttTasks'
import { createScaleFormat, editMessage, taskLabel } from '../../model/calendar/ganttFormat'

const at = (day: number): Date => new Date(2026, 9, day)
const [task, point] = normalizeTasks([
	{ id: 1, name: 'Разработка', start: '2026-10-05', end: '2026-10-09', progress: 42.4 },
	{ id: 2, name: 'Релиз', start: '2026-10-12', isMilestone: true },
])
const short = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const edit = (kind: 'move' | 'resize-end', end: number) => ({ kind, span: { start: at(5), end: at(end) } })

describe('ganttFormat', () => {
	afterEach(() => setLocale('ru'))

	it('createScaleFormat: подписи с заглавной буквы по языку', () => {
		const format = createScaleFormat('ru-RU')
		expect(format(at(5), 'day')).toBe('5')
		expect(format(at(5), 'monthYear')).toMatch(/^Октябрь 2026/)
		expect(format(at(5), 'year')).toBe('2026')
		expect(format(at(5), 'month')).toMatch(/^Окт/)
		expect(createScaleFormat('en-US')(at(5), 'monthYear')).toBe('October 2026')
	})

	it('taskLabel: полоса и веха', () => {
		expect(taskLabel(task, { start: at(5), end: at(9) }, short)).toBe('Разработка: 5 окт. — 9 окт., 42 %')
		expect(taskLabel(point, { start: at(12), end: at(12) }, short)).toBe('Релиз: 12 окт., веха')
	})

	it('taskLabel по-английски', () => {
		setLocale('en')
		const format = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' })
		expect(taskLabel(task, { start: at(5), end: at(9) }, format)).toBe('Разработка: Oct 5 — Oct 9, 42%')
	})

	it('editMessage: перенос, длительность со склонением и веха', () => {
		expect(editMessage(task, edit('move', 9), short)).toBe('Задача «Разработка» перенесена: 5 окт. — 9 окт.')
		expect(editMessage(task, edit('resize-end', 10), short)).toBe('Длительность задачи «Разработка»: 6 дней, 5 окт. — 10 окт.')
		expect(editMessage(task, edit('resize-end', 5), short)).toBe('Длительность задачи «Разработка»: 1 день, 5 окт. — 5 окт.')
		expect(editMessage(task, edit('resize-end', 7), short)).toContain('3 дня')
		expect(editMessage(point, { kind: 'move', span: { start: at(13), end: at(13) } }, short)).toBe('Веха «Релиз» перенесена: 13 окт.')
	})
})
