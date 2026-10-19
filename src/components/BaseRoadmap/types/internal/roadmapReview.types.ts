import type { RoadmapData } from '../roadmapData.types'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { ReviewSuggestion } from '@components/BaseFlowMap/types/data/flowReview.types'
import type { ReviewSuggestionView } from '@components/BaseFlowMap/types/internal/review/reviewCore.types'
import type { RoadmapChange, RoadmapCommentThread, RoadmapEntity, RoadmapProposal, RoadmapReviewData } from '../roadmapEdit.types'

/** Предложение в формате ядра карты: у ядра отклонённое называется `declined`, у роадмапа — `rejected` */
export type RoadmapSuggestion = ReviewSuggestion<RoadmapChange>

/** Элемент, к которому пишут комментарий */
export interface RoadmapReviewTarget {
	entity: RoadmapEntity
	id: string
}

/** Какие предложения показывать */
export type RoadmapReviewShow = 'all' | 'mine' | 'open'

/** Параметры связки «Правок» с моделью роадмапа */
export interface RoadmapReviewOptions {
	/** Данные роадмапа сейчас */
	data: () => RoadmapData
	/** Данные «Правок» из пропа `review` */
	review: () => RoadmapReviewData | undefined
	/** Сообщить новое значение `v-model:review` */
	emitReview: (value: RoadmapReviewData) => void
	/**
	 * Применить принятое предложение через историю правки одним шагом.
	 * `false` — применить не удалось (предложение остаётся открытым); `Promise` ждётся
	 */
	apply: (changes: RoadmapChange[], label: string) => boolean | void | Promise<boolean | void>
	/** Озвучить действие в живом регионе */
	announce: (text: string) => void
	/** Часы — для тестов */
	now?: () => number
}

/** Предложение для списка: из ядра карты плюс исходное предложение роадмапа */
export interface RoadmapProposalView {
	proposal: RoadmapProposal
	view: ReviewSuggestionView<RoadmapChange>
}

/** Состояние «Правок» роадмапа */
export interface RoadmapReviewState {
	proposals: ComputedRef<RoadmapProposal[]>
	threads: ComputedRef<RoadmapCommentThread[]>
	currentUser: ComputedRef<RoadmapReviewData['currentUser']>
	views: ComputedRef<RoadmapProposalView[]>
	/** Ждущие решения и не устаревшие */
	readyCount: ComputedRef<number>
	openCount: ComputedRef<number>
	visibleThreads: ComputedRef<RoadmapCommentThread[]>
	unreadCount: ComputedRef<number>
	show: Ref<RoadmapReviewShow>
	isResolvedShown: Ref<boolean>
	activeThreadId: Ref<string | null>
	/** Предложить изменения вместо применения; null — нечего предлагать */
	propose: (changes: RoadmapChange[], label?: string) => RoadmapProposal | null
	accept: (id: string) => Promise<boolean>
	acceptAll: () => Promise<number>
	decline: (id: string) => void
	/** Начать цепочку к этапу или теме; null — пустой текст */
	startThread: (target: RoadmapReviewTarget, text: string) => string | null
	reply: (threadId: string, text: string, parentId?: string | null) => void
	setResolved: (threadId: string, isResolved: boolean) => void
	openThread: (threadId: string | null) => void
	/** Цепочки одного элемента — для бейджа на теме */
	threadsOf: (target: RoadmapReviewTarget) => RoadmapCommentThread[]
}

/** Изменение типа «обновить» */
export type RoadmapUpdateChange = Extract<RoadmapChange, { type: 'update' }>

/** Изменение элемента: всё, кроме полей корня */
export type RoadmapEntityChange = Exclude<RoadmapChange, { type: 'root' }>

/** Цвет бейджа вида изменения */
export type RoadmapKindStatus = 'success' | 'error' | 'warning' | 'info' | 'neutral'

/** Общее для частей состояния «Правок» */
export interface RoadmapReviewContext {
	options: RoadmapReviewOptions
	state: ShallowRef<RoadmapReviewData>
	currentUser: ComputedRef<RoadmapReviewData['currentUser']>
	commit: (patch: Partial<RoadmapReviewData>) => void
	now: () => number
}

/** Часть состояния, что относится к предложениям */
export type RoadmapReviewProposals = Pick<
	RoadmapReviewState,
	'proposals' | 'views' | 'readyCount' | 'openCount' | 'show' | 'propose' | 'accept' | 'acceptAll' | 'decline'
>

/** Часть состояния, что относится к комментариям */
export type RoadmapReviewThreads = Pick<
	RoadmapReviewState,
	| 'threads'
	| 'visibleThreads'
	| 'unreadCount'
	| 'isResolvedShown'
	| 'activeThreadId'
	| 'startThread'
	| 'reply'
	| 'setResolved'
	| 'openThread'
	| 'threadsOf'
>
