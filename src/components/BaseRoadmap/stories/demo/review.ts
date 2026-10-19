import type { RoadmapProgress } from '../../types/roadmapData.types'
import type { RoadmapCommentThread, RoadmapProposal, RoadmapReviewData } from '../../types/roadmapEdit.types'

export const reviewProgress: RoadmapProgress = {
	version: 1,
	topics: {
		template: { subtopics: ['template-1', 'template-2'] },
		reactivity: { subtopics: ['reactivity-1', 'reactivity-2'] },
		components: { subtopics: ['components-1', 'components-2'] },
	},
}

const HOUR = 3_600_000
const NOW = Date.UTC(2026, 9, 18, 9, 0)

const maria = { name: 'Мария' }
const oleg = { name: 'Олег' }
const ivan = { name: 'Иван' }
const anna = { name: 'Анна' }

export const reviewUser = { name: 'Роман' }

export const reviewProposals: RoadmapProposal[] = [
	{
		id: 'p1',
		author: ivan,
		date: NOW - 2 * HOUR,
		label: 'Добавить тему «Тестирование»',
		status: 'open',
		changes: [
			{
				type: 'add',
				entity: 'topic',
				stage: 'app',
				index: 2,
				value: { id: 'testing', title: 'Тестирование', description: 'Vitest и Testing Library: тест компонента.', hours: 6 },
			},
		],
	},
	{
		id: 'p2',
		author: maria,
		date: NOW - 90 * 60_000,
		label: 'Переименовать «Маршруты» в «Vue Router»',
		status: 'open',
		changes: [{ type: 'update', entity: 'topic', id: 'router', patch: { title: 'Vue Router' }, previous: { title: 'Маршруты' } }],
	},
	{
		id: 'p3',
		author: oleg,
		date: NOW - 30 * 60_000,
		label: 'Поднять «Компоненты» выше «Реактивности»',
		status: 'open',
		changes: [
			{
				type: 'move',
				entity: 'topic',
				id: 'components',
				from: { stage: 'basics', index: 2 },
				to: { stage: 'basics', index: 1 },
			},
		],
	},
	{
		id: 'p4',
		author: anna,
		date: NOW - 26 * HOUR,
		label: 'Увеличить оценку «Общего состояния» до 8 ч',
		status: 'open',
		changes: [{ type: 'update', entity: 'topic', id: 'store', patch: { hours: 8 }, previous: { hours: 4 } }],
	},
]

export const reviewThreads: RoadmapCommentThread[] = [
	{
		id: 't1',
		target: { entity: 'topic', id: 'reactivity' },
		isUnread: true,
		comments: [
			{
				id: 'c1',
				author: maria,
				text: 'Добавьте watchEffect: без него пример с таймером не работает.',
				date: NOW - 40 * 60_000,
				replies: [{ id: 'c2', author: oleg, text: 'Согласен, вынесу в подтему.', date: NOW - 20 * 60_000 }],
			},
		],
	},
	{
		id: 't2',
		target: { entity: 'stage', id: 'app' },
		comments: [{ id: 'c3', author: ivan, text: 'Этап можно разбить: маршруты отдельно, состояние отдельно.', date: NOW - 5 * HOUR }],
	},
	{
		id: 't3',
		target: { entity: 'topic', id: 'template' },
		isResolved: true,
		comments: [{ id: 'c4', author: anna, text: 'Опечатка в описании исправлена.', date: NOW - 48 * HOUR }],
	},
]

export const reviewData: RoadmapReviewData = { proposals: reviewProposals, threads: reviewThreads, currentUser: reviewUser }

export const conflictProposals: RoadmapProposal[] = [
	{
		id: 'p1',
		author: maria,
		date: NOW - 3 * HOUR,
		label: 'Переименовать «Маршруты» в «Vue Router»',
		status: 'open',
		changes: [{ type: 'update', entity: 'topic', id: 'router', patch: { title: 'Vue Router' }, previous: { title: 'Маршруты' } }],
	},
	{
		id: 'p2',
		author: oleg,
		date: NOW - 2 * HOUR,
		label: 'Переименовать «Маршруты» в «Навигация»',
		status: 'open',
		changes: [{ type: 'update', entity: 'topic', id: 'router', patch: { title: 'Навигация' }, previous: { title: 'Маршруты' } }],
	},
	{
		id: 'p3',
		author: ivan,
		date: NOW - HOUR,
		label: 'Добавить тему «Тестирование»',
		status: 'open',
		changes: [{ type: 'add', entity: 'topic', stage: 'app', index: 2, value: { id: 'testing', title: 'Тестирование', hours: 6 } }],
	},
]
