import type { RoadmapData, RoadmapProgress, RoadmapStage, RoadmapTopic } from '@components/BaseRoadmap'

const SUBJECTS = [
	'Проектирование распределённых отказоустойчивых систем с гарантированной доставкой сообщений',
	'Сквозное тестирование пользовательских сценариев в нескольких браузерах и на разных устройствах',
	'Оптимизация производительности клиентских приложений при медленной сети и слабых устройствах',
	'Безопасная работа с персональными данными: хранение, передача и удаление по запросу пользователя',
]

function createTopics(stage: number): RoadmapTopic[] {
	return Array.from({ length: 3 }, (_, index) => ({
		id: `topic-${stage}-${index + 1}`,
		title: `${SUBJECTS[(stage + index) % SUBJECTS.length]} (часть ${index + 1})`,
		hours: 2 + index,
	}))
}

function createStages(): RoadmapStage[] {
	return Array.from({ length: 24 }, (_, index) => ({
		id: `stage-${index + 1}`,
		title: `Этап ${index + 1}. ${SUBJECTS[index % SUBJECTS.length]}`,
		topics: createTopics(index + 1),
	}))
}

export function setup() {
	const longRoadmap: RoadmapData = {
		version: 1,
		id: 'long-roadmap',
		title: 'Полный путь архитектора программных систем с очень длинным названием, которое не помещается в одну строку',
		goal: 'Архитектор программных систем в распределённой команде',
		stages: createStages(),
		view3d: { seed: 24 },
	}
	const longProgress: RoadmapProgress = {
		version: 1,
		topics: Object.fromEntries(
			longRoadmap.stages
				.slice(0, 9)
				.flatMap(stage => stage.topics)
				.map(topic => [topic.id, { status: 'done' as const }]),
		),
	}
	return { longRoadmap, longProgress }
}
