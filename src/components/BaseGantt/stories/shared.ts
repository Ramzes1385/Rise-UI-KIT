import type { GanttScale, GanttTask } from '../types/BaseGantt.types'

export const GANTT_TODAY = '2025-05-15'

export const PROJECT_TASKS: GanttTask[] = [
	{ id: 'design', name: 'Дизайн', start: '2025-05-05', end: '2025-05-16', progress: 85 },
	{ id: 'research', name: 'Исследование', start: '2025-05-05', end: '2025-05-08', progress: 100, parentId: 'design' },
	{
		id: 'wireframes',
		name: 'Прототипы',
		start: '2025-05-09',
		end: '2025-05-13',
		progress: 100,
		parentId: 'design',
		dependencies: ['research'],
	},
	{ id: 'ui', name: 'Интерфейс', start: '2025-05-12', end: '2025-05-16', progress: 60, parentId: 'design', dependencies: ['wireframes'] },
	{ id: 'dev', name: 'Разработка', start: '2025-05-14', end: '2025-06-06', progress: 30 },
	{ id: 'frontend', name: 'Вёрстка', start: '2025-05-14', end: '2025-05-28', progress: 40, parentId: 'dev', dependencies: ['ui'] },
	{ id: 'backend', name: 'Серверная часть', start: '2025-05-15', end: '2025-06-04', progress: 25, parentId: 'dev', dependencies: ['ui'] },
	{
		id: 'integration',
		name: 'Интеграция',
		start: '2025-06-02',
		end: '2025-06-06',
		progress: 0,
		parentId: 'dev',
		dependencies: ['frontend', 'backend'],
	},
	{ id: 'qa', name: 'Тестирование', start: '2025-06-05', end: '2025-06-13', progress: 0, dependencies: ['integration'] },
	{ id: 'launch', name: 'Запуск', start: '2025-06-16', isMilestone: true, dependencies: ['qa'] },
]

export const SCALE_OPTIONS: { value: GanttScale; label: string }[] = [
	{ value: 'day', label: 'Дни' },
	{ value: 'week', label: 'Недели' },
	{ value: 'month', label: 'Месяцы' },
]

export const MILESTONE_TASKS: GanttTask[] = [
	{ id: 'kickoff', name: 'Старт проекта', start: '2025-05-05', isMilestone: true },
	{ id: 'prototype', name: 'Прототип', start: '2025-05-05', end: '2025-05-14', progress: 100, dependencies: ['kickoff'] },
	{ id: 'demo', name: 'Демо заказчику', start: '2025-05-15', isMilestone: true, dependencies: ['prototype'] },
	{ id: 'mvp', name: 'MVP', start: '2025-05-16', end: '2025-06-03', progress: 20, dependencies: ['demo'] },
	{ id: 'release', name: 'Релиз', start: '2025-06-04', isMilestone: true, dependencies: ['mvp'] },
]

export function manyTasks(groups: number): GanttTask[] {
	return Array.from({ length: groups }, (_, group) => {
		const start = group % 25
		return [
			{
				id: `group-${group}`,
				name: `Этап ${group + 1}`,
				start: `2025-05-${String(start + 1).padStart(2, '0')}`,
				end: `2025-06-${String((start % 20) + 8).padStart(2, '0')}`,
			},
			{
				id: `task-${group}-a`,
				name: `Подготовка этапа ${group + 1}`,
				start: `2025-05-${String(start + 1).padStart(2, '0')}`,
				end: `2025-05-${String(start + 4).padStart(2, '0')}`,
				progress: (group * 7) % 100,
				parentId: `group-${group}`,
			},
			{
				id: `task-${group}-b`,
				name: `Выполнение этапа ${group + 1}`,
				start: `2025-05-${String(start + 5).padStart(2, '0')}`,
				end: `2025-06-${String((start % 20) + 8).padStart(2, '0')}`,
				progress: (group * 13) % 100,
				parentId: `group-${group}`,
				dependencies: [`task-${group}-a`],
			},
		]
	}).flat()
}

export const LINK_TYPE_TASKS: GanttTask[] = [
	{ id: 'base', name: 'Основа', start: '2025-05-05', end: '2025-05-12', progress: 100 },
	{ id: 'fs', name: 'Окончание — начало', start: '2025-05-14', end: '2025-05-19', dependencies: ['base'] },
	{ id: 'ss', name: 'Начало — начало', start: '2025-05-06', end: '2025-05-13', dependencies: [{ id: 'base', type: 'SS' }] },
	{ id: 'ff', name: 'Окончание — окончание', start: '2025-05-09', end: '2025-05-15', dependencies: [{ id: 'base', type: 'FF' }] },
	{ id: 'sf', name: 'Начало — окончание', start: '2025-05-01', end: '2025-05-06', dependencies: [{ id: 'base', type: 'SF' }] },
]
