import type { RoadmapData, RoadmapProgress } from '../../types/roadmapData.types'

export const DEMO_EXTERNAL_URL = 'https://example.org'

export const miniRoadmap: RoadmapData = {
	version: 1,
	id: 'vue-start',
	title: 'Старт во Vue',
	goal: 'Первое приложение',
	stages: [
		{
			id: 'basics',
			title: 'Основы',
			topics: [
				{
					id: 'template',
					title: 'Шаблоны',
					description: 'Разметка компонента: интерполяция, директивы, условия и списки.',
					hours: 3,
					subtopics: [
						{ id: 'template-1', title: 'Интерполяция и директивы' },
						{ id: 'template-2', title: 'Условия и списки' },
					],
				},
				{
					id: 'reactivity',
					title: 'Реактивность',
					description: 'ref, reactive и computed: как Vue следит за данными.',
					hours: 4,
					requires: ['template'],
					subtopics: [
						{ id: 'reactivity-1', title: 'ref и reactive' },
						{ id: 'reactivity-2', title: 'computed и watch' },
					],
				},
				{
					id: 'components',
					title: 'Компоненты',
					description: 'Пропсы, события и слоты.',
					hours: 5,
					requires: ['template'],
					subtopics: [
						{ id: 'components-1', title: 'Пропсы и события' },
						{ id: 'components-2', title: 'Слоты' },
					],
				},
			],
		},
		{
			id: 'app',
			title: 'Приложение',
			requires: ['basics'],
			topics: [
				{ id: 'router', title: 'Маршруты', description: 'Страницы и переходы между ними.', hours: 4 },
				{ id: 'store', title: 'Общее состояние', description: 'Хранилище данных для нескольких компонентов.', hours: 5 },
			],
		},
	],
}

export const miniProgress: RoadmapProgress = {
	version: 1,
	topics: {
		template: { subtopics: ['template-1', 'template-2'] },
		reactivity: { subtopics: ['reactivity-1'] },
	},
}

export const noProgress: RoadmapProgress = { version: 1, topics: {} }
