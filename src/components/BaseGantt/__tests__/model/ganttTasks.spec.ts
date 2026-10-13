import { TASKS } from '../fixtures'
import type { GanttTask } from '../../types/BaseGantt.types'
import { normalizeTasks, visibleItems } from '../../model/tasks/ganttTasks'

const ids = (tasks: GanttTask[]): (string | number)[] => normalizeTasks(tasks).map(item => item.id)
const task = (id: string | number, extra: Partial<GanttTask> = {}): GanttTask => ({
	id,
	name: `Задача ${id}`,
	start: '2026-10-05',
	...extra,
})

describe('ganttTasks', () => {
	let warn: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => {
		warn.mockRestore()
	})

	describe('normalizeTasks', () => {
		it('выстраивает дерево в порядке обхода и считает уровни, позиции и детей', () => {
			const items = normalizeTasks([task('b', { parentId: 'a' }), task('a'), task('c'), task('d', { parentId: 'a' })])
			expect(items.map(item => [item.id, item.level, item.position, item.setSize, item.hasChildren])).toEqual([
				['a', 0, 1, 2, true],
				['b', 1, 1, 2, false],
				['d', 1, 2, 2, false],
				['c', 0, 2, 2, false],
			])
			expect(items[1].parentId).toBe('a')
		})

		it('приводит даты к дням, окончание по умолчанию — день начала, прогресс ограничен', () => {
			const [item] = normalizeTasks([task(1, { start: '2026-10-05T15:00', progress: 120 })])
			expect(item.start).toEqual(new Date(2026, 9, 5))
			expect(item.end).toEqual(new Date(2026, 9, 5))
			expect(item.progress).toBe(100)
			expect(warn).not.toHaveBeenCalled()
		})

		it('у вехи окончание равно началу', () => {
			const [item] = normalizeTasks([task(1, { end: '2026-10-09', isMilestone: true })])
			expect(item.isMilestone).toBe(true)
			expect(item.end).toEqual(item.start)
		})

		it('пропускает повторяющийся id с предупреждением', () => {
			expect(ids([task(1), task(1, { name: 'Дубль' })])).toEqual([1])
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('повторяющийся id «1»'))
		})

		it('пропускает задачу с неверной датой начала или окончания', () => {
			expect(ids([task(1, { start: 'нет' }), task(2, { end: 'нет' }), task(3)])).toEqual([3])
			expect(warn).toHaveBeenCalledTimes(2)
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('нет корректной даты'))
		})

		it('окончание раньше начала приравнивает к началу', () => {
			const [item] = normalizeTasks([task(1, { end: '2026-10-01' })])
			expect(item.end).toEqual(item.start)
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('окончание раньше начала'))
		})

		it('неизвестный родитель и родитель-сам-себе — верхний уровень с предупреждением', () => {
			const items = normalizeTasks([task(1, { parentId: 'нет' }), task(2, { parentId: 2 })])
			expect(items.map(item => item.level)).toEqual([0, 0])
			expect(warn).toHaveBeenCalledTimes(2)
		})

		it('цикл родителей разрывается, остальные задачи остаются', () => {
			const items = normalizeTasks([
				task('a', { parentId: 'b' }),
				task('b', { parentId: 'a' }),
				task('c', { parentId: 'a' }),
				task('d'),
			])
			expect(items.map(item => item.id).sort()).toEqual(['a', 'b', 'c', 'd'])
			expect(items.find(item => item.id === 'a')?.level).toBe(0)
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('замыкает цикл'))
		})

		it('зависимости: оставляет известные без повторов', () => {
			const items = normalizeTasks([task('a'), task('b', { dependencies: ['a', 'a'] })])
			expect(items[1].dependencies).toEqual(['a'])
		})

		it('зависимости: неизвестные и замыкающие цикл игнорирует с предупреждением', () => {
			const items = normalizeTasks([
				task('a', { dependencies: ['b', 'нет', 'a'] }),
				task('b', { dependencies: ['c'] }),
				task('c', { dependencies: ['a'] }),
			])
			expect(items.map(item => item.dependencies)).toEqual([['b'], ['c'], []])
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('такой задачи нет'))
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('замыкает цикл'))
		})

		it('зависимости: ромб из связей не мешает проверке цикла', () => {
			const items = normalizeTasks([
				task('k'),
				task('y', { dependencies: ['w'] }),
				task('z', { dependencies: ['w'] }),
				task('v', { dependencies: ['y', 'z'] }),
				task('w', { dependencies: ['k'] }),
			])
			expect(items.find(item => item.id === 'w')?.dependencies).toEqual(['k'])
		})

		it('пустой список даёт пустой результат', () => {
			expect(normalizeTasks([])).toEqual([])
		})

		it('разбирает общий набор задач', () => {
			expect(ids(TASKS)).toEqual(['project', 'analysis', 'build', 'release', 'audit'])
		})
	})

	describe('visibleItems', () => {
		const items = normalizeTasks([
			task('a'),
			task('b', { parentId: 'a' }),
			task('c', { parentId: 'b' }),
			task('d', { parentId: 'a' }),
			task('e'),
		])

		it('без свёрнутых показывает всё', () => {
			expect(visibleItems(items, new Set()).map(item => item.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
		})

		it('скрывает потомков свёрнутой задачи на всех уровнях', () => {
			expect(visibleItems(items, new Set(['a'])).map(item => item.id)).toEqual(['a', 'e'])
			expect(visibleItems(items, new Set(['b'])).map(item => item.id)).toEqual(['a', 'b', 'd', 'e'])
		})

		it('свёрнутая задача без детей ничего не скрывает', () => {
			expect(visibleItems(items, new Set(['e'])).map(item => item.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
		})
	})
})
