import type { FlowPoint, FlowRect } from '../../data/flowData.types'
import type { FlowCommentThread } from '../../data/flowReview.types'
import type { ReviewChangeKind, ReviewField } from './reviewCore.types'

/** Что рисовать для метки на холсте */
export interface ReviewDrawable {
	/** Ключ для списка */
	key: string
	/** Что сделано */
	kind: ReviewChangeKind
	/** Предложение; draft — черновик */
	suggestionId?: string
	/** Рамка: узел, группа или призрак на новом месте */
	rect?: FlowRect
	/** Путь связи SVG */
	path?: string
	/** Откуда сдвинут узел: начало пунктирной стрелки */
	from?: FlowPoint
	/** Точка значка «+ − ~» */
	glyphPoint: FlowPoint
	/** Знак */
	glyph: string
	/** Подпись значка: автор */
	author?: string
	/** Текст для подсказки и озвучки */
	title: string
	/** Изменённые поля */
	fields: ReviewField[]
	/** Подпись призрака (добавленный узел) */
	text?: string
	/** Метка сфокусирована в панели */
	isHot: boolean
	/** Элемента нет на холсте: рисуем призрак (предложенный узел, связь или убранный между версиями) */
	isGhost: boolean
}

/** Булавка комментариев на экране */
export interface ReviewPin {
	/** Цепочка */
	thread: FlowCommentThread
	/** X на экране, px */
	x: number
	/** Y на экране, px */
	y: number
	/** Сколько комментариев */
	count: number
	/** Инициал автора первого комментария */
	initials: string
	/** Подпись для скринридера */
	label: string
}
