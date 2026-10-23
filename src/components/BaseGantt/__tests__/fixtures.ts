import type { GanttTask } from '../types/BaseGantt.types'

export const TODAY = '2026-10-14'

export const TASKS: GanttTask[] = [
	{ id: 'project', name: 'Проект', start: '2026-10-05', end: '2026-10-23', progress: 40 },
	{ id: 'analysis', name: 'Анализ', start: '2026-10-05', end: '2026-10-09', progress: 100, parentId: 'project' },
	{
		id: 'build',
		name: 'Разработка',
		start: '2026-10-12',
		end: '2026-10-20',
		progress: 30,
		parentId: 'project',
		dependencies: ['analysis'],
	},
	{ id: 'release', name: 'Релиз', start: '2026-10-23', isMilestone: true, parentId: 'project', dependencies: ['build'] },
	{ id: 'audit', name: 'Аудит', start: new Date(2026, 9, 26), end: new Date(2026, 9, 28) },
]

export const DATE = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

export const day = (value: number): Date => new Date(2026, 9, value)
