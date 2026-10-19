/** `optional` — «По желанию»: этапу не нужна. По умолчанию `required` */
export const ROADMAP_TOPIC_KINDS = ['required', 'optional'] as const
export type RoadmapTopicKind = (typeof ROADMAP_TOPIC_KINDS)[number]

/** Вид материала: значок и подпись «документация», «статья», «видео»… */
export const ROADMAP_MATERIAL_KINDS = ['doc', 'article', 'video', 'course', 'book', 'practice', 'link'] as const
export type RoadmapMaterialKind = (typeof ROADMAP_MATERIAL_KINDS)[number]

/** Статус, который ставит пользователь (хранится в прогрессе) */
export const ROADMAP_PROGRESS_STATUSES = ['in-progress', 'done', 'skipped'] as const
export type RoadmapProgressStatus = (typeof ROADMAP_PROGRESS_STATUSES)[number]

/** Вычисленный статус темы (показывается; в данных не хранится) */
export const ROADMAP_TOPIC_STATUSES = ['locked', 'available', 'in-progress', 'done', 'skipped'] as const
export type RoadmapTopicStatus = (typeof ROADMAP_TOPIC_STATUSES)[number]

/** Вычисленный статус этапа */
export const ROADMAP_STAGE_STATUSES = ['locked', 'available', 'current', 'done'] as const
export type RoadmapStageStatus = (typeof ROADMAP_STAGE_STATUSES)[number]

/** Формат данных роадмапа, версия 1 */
export const ROADMAP_DATA_VERSION = 1

export interface RoadmapData {
	/** Версия формата — `ROADMAP_DATA_VERSION` */
	version: number
	/** Ключ прогресса в хранилище; без него — хеш `title` */
	id?: string
	/** Заголовок: «Frontend-разработчик на Vue» */
	title: string
	/** Цель — подпись финиша: «Frontend-разработчик» (2D — после последнего этапа, 3D — флажок на горе) */
	goal?: string
	/** Описание — подзаголовок и описание области для скринридера */
	description?: string
	/** Этапы по порядку прохождения: порядок массива — порядок пути */
	stages: RoadmapStage[]
	/** Настройки 3D (BaseRoadmap их не читает, но сохраняет) */
	view3d?: RoadmapView3D
	/** Данные приложения: кит их не читает и сохраняет без изменений */
	meta?: Record<string, unknown>
}

export interface RoadmapStage {
	/** Id, уникальный среди этапов и тем роадмапа */
	id: string
	/** Название */
	title: string
	/** Описание */
	description?: string
	/** Значок этапа в 2D — имя BaseIcon; без него — номер */
	icon?: string
	/** Id этапов или тем: этап закрыт («Откроется после этапа 5»), пока они не пройдены */
	requires?: string[]
	/** `optional` — необязательный этап («Сделать необязательным» в правке): не закрывает следующие и не входит в «осталось ≈ ч». По умолчанию `required` */
	kind?: RoadmapTopicKind
	/** Темы по порядку */
	topics: RoadmapTopic[]
	/** Поля 3D этапа */
	model3d?: RoadmapStage3D
	/** Данные приложения */
	meta?: Record<string, unknown>
}

export interface RoadmapTopic {
	/** Id, уникальный среди этапов и тем */
	id: string
	/** Название */
	title: string
	/** Описание — простой текст без HTML (своя разметка — слот `topic-details`) */
	description?: string
	/** Оценка, часы ≥ 0: сумма этапа, «осталось ≈ N ч» */
	hours?: number
	/** Обязательная или по желанию */
	kind?: RoadmapTopicKind
	/** Группа «или» внутри этапа: этапу хватает одной темы группы; вторая и дальше — бейдж «Альтернатива», между ними «или» */
	choice?: string
	/** Статус по умолчанию: берётся, пока у темы нет своего статуса в прогрессе; без поля — по подтемам. «Закрыта» вычисляется всегда */
	defaultStatus?: RoadmapProgressStatus
	/** Метка «советуем» */
	isRecommended?: boolean
	/** «Нужно знать»: id тем или этапов; тема закрыта, пока они не пройдены */
	requires?: string[]
	/** «Что изучить» — чекбоксы; отмечены все — тема изучена */
	subtopics?: RoadmapSubtopic[]
	/** Материалы */
	materials?: RoadmapMaterial[]
	/** Метки для поиска и фильтра */
	tags?: string[]
	/** Данные приложения */
	meta?: Record<string, unknown>
}

export interface RoadmapSubtopic {
	/** Id, уникальный в теме */
	id: string
	/** Название */
	title: string
}

export interface RoadmapMaterial {
	/** Id для ключа списка; без него — порядковый номер */
	id?: string
	/** Название */
	title: string
	/** Вид */
	kind: RoadmapMaterialKind
	/** Ссылка; другой origin — новая вкладка и «откроется в новой вкладке» для скринридера */
	url?: string
	/** Длительность, минуты: «40 мин», «1 ч» — формат из словаря */
	minutes?: number
}

/** Поля 3D этапа (только данные, без three) */
export interface RoadmapStage3D {
	/** Модель на пьедестале: id встроенной (`window`, `code`, `gear`…) или ключ `models`; без него — по ключевым словам названия */
	model?: string
	/** Своя модель GLB/GLTF по адресу — вместо `model` */
	url?: string
	/** Масштаб модели, > 0 */
	scale?: number
	/** Цвет пьедестала и модели — токен или CSS-цвет; по умолчанию — `--rise-chart-<n>` по номеру этапа */
	tint?: string
}

/** Настройки 3D-острова */
export interface RoadmapView3D {
	/** Зерно гор, деревьев, облаков и формы берегов; по умолчанию — хеш `id ?? title` */
	seed?: number
	/** Этапов в ряду змейки, 2–4; по умолчанию ≤ 6 этапов → 2, ≤ 12 → 3, иначе 4 */
	perRow?: number
	/** Машинка на дороге; по умолчанию true */
	hasCar?: boolean
	/** Пресет камеры: `iso` (по умолчанию), `iso-90`, `iso-180`, `iso-270`, `top` */
	camera?: string
}

/** Прогресс пользователя — отдельно от данных: данные пишет автор, прогресс — ученик */
export interface RoadmapProgress {
	/** Версия формата прогресса — 1 */
	version: number
	/** Темы: id → прогресс */
	topics: Record<string, RoadmapTopicProgress>
}

export interface RoadmapTopicProgress {
	/** Явный статус; без него — по подтемам */
	status?: RoadmapProgressStatus
	/** Id отмеченных подтем */
	subtopics?: string[]
	/** Время изменения, ISO (ставит компонент) — слияние прогресса из хранилища по темам */
	updatedAt?: string
}
/** Хранилище прогресса: localStorage, сервер приложения или своё — один интерфейс */
export interface RoadmapProgressStorage {
	/** Прогресс роадмапа `key` (`data.id` или хеш `title`); null — нет */
	load: (key: string) => RoadmapProgress | null | Promise<RoadmapProgress | null>
	/** Сохранить */
	save: (key: string, progress: RoadmapProgress) => void | Promise<void>
}
