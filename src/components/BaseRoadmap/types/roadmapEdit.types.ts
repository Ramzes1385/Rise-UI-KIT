import type { CommentAuthor, CommentItem } from '@components/BaseCommentThread'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from './roadmapData.types'

/** Сущности роадмапа */
export const ROADMAP_ENTITIES = ['stage', 'topic'] as const
export type RoadmapEntity = (typeof ROADMAP_ENTITIES)[number]

/**
 * Атомарное изменение данных: из них состоят команды «Правки», история и предложения «Правок».
 * В `patch` и `previous` значение `undefined` значит «поля нет» (при применении поле удаляется).
 */
export type RoadmapChange =
	| { type: 'add'; entity: 'stage'; value: RoadmapStage; index: number }
	| { type: 'add'; entity: 'topic'; stage: string; value: RoadmapTopic; index: number }
	| { type: 'remove'; entity: 'stage'; id: string; value: RoadmapStage; index: number }
	| { type: 'remove'; entity: 'topic'; id: string; stage: string; value: RoadmapTopic; index: number }
	| { type: 'move'; entity: 'stage'; id: string; from: number; to: number }
	| {
			type: 'move'
			entity: 'topic'
			id: string
			from: { stage: string; index: number }
			to: { stage: string; index: number }
	  }
	| { type: 'update'; entity: RoadmapEntity; id: string; patch: Record<string, unknown>; previous: Record<string, unknown> }
	| { type: 'root'; patch: Partial<Omit<RoadmapData, 'stages'>>; previous: Partial<Omit<RoadmapData, 'stages'>> }

/** Шаблон: весь путь («Начать с шаблона»), этап или тема; id генерирует компонент, если не заданы */
export interface RoadmapTemplate {
	id: string
	/** Подпись в палитре: «Backend на Go» */
	title: string
	/** Вторая строка: «7 этапов» (без неё — число этапов) */
	subtitle?: string
	/** Весь путь: заменяет данные одним шагом истории (непустой путь — после BaseConfirm) */
	data?: RoadmapData
	stage?: Omit<RoadmapStage, 'id'> & { id?: string }
	topic?: Omit<RoadmapTopic, 'id'> & { id?: string }
}

/** Изменение одного вида */
export type RoadmapChangeOf<T extends RoadmapChange['type']> = Extract<RoadmapChange, { type: T }>

/** Состояния предложения: ждёт решения, принято, отклонено */
export const ROADMAP_PROPOSAL_STATUSES = ['open', 'accepted', 'rejected'] as const
export type RoadmapProposalStatus = (typeof ROADMAP_PROPOSAL_STATUSES)[number]

/** Предложение «Правок»: набор изменений, который автор отправил вместо применения */
export interface RoadmapProposal {
	id: string
	author: CommentAuthor
	date: Date | string | number
	/** Заголовок («Добавить «Pinia»»); без него панель собирает его из изменений */
	label?: string
	changes: RoadmapChange[]
	status: RoadmapProposalStatus
}

/** Цепочка комментариев к этапу или теме */
export interface RoadmapCommentThread {
	id: string
	target: { entity: RoadmapEntity; id: string }
	comments: CommentItem[]
	isResolved?: boolean
	/** Есть непрочитанное: цепочка выделена, пока её не откроют */
	isUnread?: boolean
}

/** Данные «Правок» (`v-model:review`): предложения, цепочки комментариев и текущий пользователь */
export interface RoadmapReviewData {
	proposals?: RoadmapProposal[]
	threads?: RoadmapCommentThread[]
	currentUser?: CommentAuthor
}
