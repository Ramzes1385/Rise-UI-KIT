import type { CommentItem } from '@components/BaseCommentThread'
import type { FlowSuggestionStatus, ReviewSuggestion } from '../../data/flowReview.types'

/** Вид изменения элемента в «Правках»: add — добавило, remove — убрало, rename — сменило подпись, move — сдвинуло, update — поменяло другие поля */
export type ReviewChangeKind = 'add' | 'remove' | 'rename' | 'move' | 'update'

/** Вид предложения целиком: вид изменений или mixed, когда виды разные */
export type ReviewSuggestionKind = ReviewChangeKind | 'mixed'

/** Поле, которое изменилось: было и стало */
export interface ReviewField {
	/** Имя поля */
	field: string
	/** Было */
	before: unknown
	/** Стало */
	after: unknown
}

/** Описание одного изменения, не зависящее от формата изменений приложения */
export interface ReviewChangeInfo {
	/** Что сделано */
	kind: ReviewChangeKind
	/** Сущность: node, edge, stage… */
	entity: string
	/** Id элемента */
	id: string
	/** Изменённые поля (у add и remove — пусто) */
	fields: ReviewField[]
	/** Добавленный или убранный элемент целиком */
	value?: unknown
	/** Id других элементов, без которых изменение не имеет смысла (концы связи) */
	refs?: string[]
}

/** Как «Правки» читают изменения `C` — это единственное, что известно только карте или роадмапу */
export interface ReviewAdapter<C, D = unknown> {
	/** Описать изменение; null — изменение не относится к элементу (поля корня) и в «Правках» не показывается */
	describe: (change: C) => ReviewChangeInfo | null
	/** Можно ли применить изменение к данным сейчас; без функции предложение не считается конфликтным */
	isApplicable?: (data: D, change: C) => boolean
}

/** То, что нужно для показа изменений: без данных */
export type ReviewDescriber<C> = Pick<ReviewAdapter<C>, 'describe'>

/** Метка на элементе: что предложение делает с ним */
export interface ReviewMark {
	/** Ключ `entity:id` */
	key: string
	/** Сущность */
	entity: string
	/** Id */
	id: string
	/** Что сделано */
	kind: ReviewChangeKind
	/** Изменённые поля: было → стало */
	fields: ReviewField[]
	/** Добавленный или убранный элемент */
	value?: unknown
	/** Предложение, из которого взята метка */
	suggestionId?: string
	/** Автор предложения */
	author?: string
}

/** Сколько элементов затронуто: «+2 узла, −1 связь» */
export interface ReviewCount {
	/** add — добавлено, remove — убрано, update — изменено */
	kind: 'add' | 'remove' | 'update'
	/** Сущность */
	entity: string
	/** Сколько */
	count: number
}

/** Какие предложения показывать: `show` — «Всё · Только мои · Неразрешённые», `authors` — скрытые авторы */
export interface ReviewFilter {
	/** all — всё, mine — только мои, open — только ждущие решения */
	show: 'all' | 'mine' | 'open'
	/** Имена скрытых авторов */
	hiddenAuthors?: ReadonlySet<string>
	/** Имя текущего пользователя — для `mine` */
	currentUser?: string
	/** Показывать принятые и отклонённые */
	isDoneShown?: boolean
}

/** Счётчики предложений по состояниям */
export type ReviewStatusCounts = Record<FlowSuggestionStatus, number>

/** Данные, от которых зависит «устарело» */
export interface ReviewStaleContext<D> {
	/** Данные сейчас */
	data: D
	/** Id текущей версии данных */
	versionId?: string
}

/** Предложение с вычисленными полями для списка */
export interface ReviewSuggestionView<C> {
	/** Предложение */
	suggestion: ReviewSuggestion<C>
	/** Вид предложения */
	kind: ReviewSuggestionKind
	/** Сводка */
	counts: ReviewCount[]
	/** Устарело */
	isStale: boolean
	/** Время в мс */
	time: number
}

/** Цепочка комментариев в нужном `ReviewThread` виде для функций комментариев */
export interface ReviewThreadLike {
	/** Id */
	id: string
	/** Комментарии */
	comments: CommentItem[]
	/** Решена */
	isResolved?: boolean
	/** Есть непрочитанное */
	isUnread?: boolean
	/** Цель */
	target?: { entity: string; id: string }
}

/** Новый комментарий */
export interface ReviewNewComment {
	/** Автор */
	author: CommentItem['author']
	/** Текст */
	text: string
	/** Время в мс */
	date: number
}
