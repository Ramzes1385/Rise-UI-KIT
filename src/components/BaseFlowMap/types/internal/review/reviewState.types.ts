import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowPoint } from '../../data/flowData.types'
import type { FlowMapController } from '../../api/flowController.types'
import type { ReviewCount, ReviewMark, ReviewStatusCounts, ReviewSuggestionView } from './reviewCore.types'
import type { FlowAuthor, FlowChange, FlowCommentThread, FlowElementRef, FlowSuggestion, FlowVersion } from '../../data/flowReview.types'

/** Слои сравнения: old — «Было», new — «Стало», diff — «Разница» */
/** Слой сравнения */
export type FlowCompareSide = 'old' | 'new' | 'diff'

/** Фильтры панели и холста */
export interface FlowReviewFilters {
	/** Что показывать: всё, только мои, только неразрешённые */
	show: Ref<'all' | 'mine' | 'open'>
	/** Имена скрытых авторов */
	hidden: Ref<ReadonlySet<string>>
	/** Только изменения: остальные элементы приглушены */
	isOnlyChanged: Ref<boolean>
	/** Показывать принятые и отклонённые */
	isDoneShown: Ref<boolean>
	/** Скрыть или показать автора */
	toggleAuthor: (name: string) => void
}

/** Состояние предложений */
export interface FlowReviewSuggestions {
	/** Все предложения, в том числе устаревшие и разобранные */
	list: ShallowRef<FlowSuggestion[]>
	/** Предложения после фильтров, новые сверху */
	views: ComputedRef<ReviewSuggestionView<FlowChange>[]>
	/** Авторы предложений */
	authors: ComputedRef<FlowSuggestion['author'][]>
	/** Счётчики по состояниям */
	counts: ComputedRef<ReviewStatusCounts>
	/** Изменения черновика */
	draftChanges: ComputedRef<FlowChange[]>
	/** Предложение, на которое наведён указатель или фокус */
	focusId: Ref<string | null>
	/** Сколько предложений выйдет из черновика: изменения, связанные между собой, идут одним предложением */
	draftCount: ComputedRef<number>
	/** Убрать черновик */
	discard: () => void
	/** Отправить черновик предложениями */
	submit: () => FlowSuggestion[]
	/** Принять */
	accept: (id: string) => Promise<boolean>
	/** Принять все ждущие и не устаревшие */
	acceptAll: () => Promise<number>
	/** Отклонить */
	decline: (id: string) => void
}

/** Цель нового комментария: элемент или точка холста */
export interface FlowCommentTarget {
	/** Элемент */
	target?: FlowElementRef
	/** Точка холста */
	point?: FlowPoint
}

/** Состояние комментариев */
export interface FlowReviewComments {
	/** Все цепочки */
	list: ShallowRef<FlowCommentThread[]>
	/** Цепочки после фильтра «решённые» */
	visible: ComputedRef<FlowCommentThread[]>
	/** Сколько непрочитанных */
	unread: ComputedRef<number>
	/** Показывать решённые */
	isResolvedShown: Ref<boolean>
	/** Открытая цепочка */
	activeId: Ref<string | null>
	/** Новая цепочка на элементе или точке: возвращает её id */
	start: (target: FlowCommentTarget, text: string) => string | null
	/** Комментарий или ответ */
	reply: (threadId: string, text: string, parentId?: string | null) => void
	/** Решить или вернуть */
	setResolved: (threadId: string, isResolved: boolean) => void
	/** Открыть цепочку: помечает прочитанной */
	open: (threadId: string | null) => void
	/** Цепочку только что закрыли (клик вне булавки): заголовок карточки не должен открыть её снова */
	isJustClosed: (threadId: string) => boolean
}

/** Состояние версий и сравнения */
export interface FlowReviewCompare {
	/** Версии, новые сверху */
	versions: ComputedRef<FlowVersion[]>
	/** Текущая версия — самая поздняя */
	currentId: ComputedRef<string | undefined>
	/** С какой версией сравниваем */
	compareId: Ref<string | null>
	/** Слой сравнения */
	side: Ref<'old' | 'new' | 'diff'>
	/** Изменения «было → стало» */
	changes: ComputedRef<FlowChange[]>
	/** Сводка изменений */
	counts: ComputedRef<ReviewCount[]>
	/** Выбрать версию для сравнения; null — закрыть */
	select: (id: string | null) => void
}

/** Всё состояние «Правок» для интерфейса */
export interface FlowReviewState {
	/** Режим «Правки» включён */
	isActive: ComputedRef<boolean>
	/** Вкладка */
	tab: Ref<'suggestions' | 'comments' | 'versions'>
	/** Фильтры */
	filters: FlowReviewFilters
	/** Предложения */
	suggestions: FlowReviewSuggestions
	/** Комментарии */
	comments: FlowReviewComments
	/** Сравнение версий */
	compare: FlowReviewCompare
	/** Метки на холсте */
	marks: ComputedRef<ReviewMark[]>
	/** Текущий пользователь */
	currentUser: ComputedRef<FlowAuthor | undefined>
	/** Контроллер */
	controller: FlowMapController
	/** Сообщить в live-регион */
	announce: (text: string) => void
}

/** Что нужно меткам холста: контекст карты, метки, места призраков */
export interface ReviewScene {
	/** Контекст карты */
	map: import('../flowModel.types').FlowMapContext
	/** Метки */
	marks: readonly import('./reviewCore.types').ReviewMark[]
	/** Места предложенных узлов */
	ghosts: ReadonlyMap<string, import('../../data/flowData.types').FlowRect>
}

/** Части состояния, от которых зависят метки */
export interface ReviewMarkParts {
	/** Режим «Правки» включён */
	isActive: ComputedRef<boolean>
	/** Фильтры */
	filters: FlowReviewFilters
	/** Предложения */
	suggestions: FlowReviewSuggestions
	/** Сравнение */
	compare: FlowReviewCompare
}

/** Части состояния предложений */
export interface ReviewSuggestionParts {
	/** Фильтры */
	filters: FlowReviewFilters
	/** Id текущей версии */
	versionId: () => string | undefined
	/** Озвучка */
	announce: (text: string) => void
}

/** Место предложенного узла: размер и соседний узел */
export interface ReviewGhostSpot {
	/** Размер */
	size: import('../../data/flowData.types').FlowSize
	/** Узел, рядом с которым ставим */
	neighbour?: import('../../data/flowData.types').FlowRect
	/** Границы карты */
	bounds: import('../../data/flowData.types').FlowRect
}
