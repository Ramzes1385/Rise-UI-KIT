import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { ImageMapEditorTool } from './BaseImageMapEditor.types'
import type { ImageMapData, ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

/** Точка в долях картинки слоя */
export interface EditorPoint {
	/** По горизонтали, 0–1 */
	x: number
	/** По вертикали, 0–1 */
	y: number
}

/** Ручка выделенного объекта: угол рамки (0 — левый верхний, по часовой) или вершина многоугольника */
export interface EditorHandle extends EditorPoint {
	/** Номер угла или вершины */
	index: number
}

/** Что делает протяжка указателя */
type EditorDragKind = 'move' | 'handle' | 'draw'

/** Состояние протяжки указателем или клавиатурой */
export interface EditorDrag {
	/** Вид протяжки */
	kind: EditorDragKind
	/** Начало протяжки */
	start: EditorPoint
	/** Текущая точка */
	current: EditorPoint
	/** Объект, который двигают (move, handle) */
	objectId?: string
	/** Номер ручки (handle) */
	handle?: number
	/** Копия объекта на начало протяжки */
	origin?: ImageMapObject
	/** Была ли правка (указатель сдвинулся) */
	isChanged: boolean
}

/** Изменение карты: мутирует черновик */
export type EditorMutation = (draft: ImageMapData) => void

/** Документ редактора для частей модели */
interface EditorDocumentApi {
	/** Текущий JSON карты */
	getData: () => ImageMapData
	/** Правка одним шагом истории; `mergeKey` — правки с тем же ключом подряд склеиваются (ввод текста) */
	apply: (mutate: EditorMutation, mergeKey?: string) => void
	/** Начать правку протяжкой: следующий `commit` запишет один шаг истории */
	begin: () => void
	/** Закончить правку протяжкой */
	commit: () => void
}

/** Текущий слой и выделение */
interface EditorSelectionApi {
	/** Показанный слой */
	getLayer: () => ImageMapLayer | undefined
	/** Выделенный объект */
	getSelected: () => ImageMapObject | undefined
	/** Выделить объект или снять выделение */
	select: (id: string | null) => void
}

/** Сообщение для `role="status"` и ошибки импорта */
export interface EditorAnnouncer {
	/** Озвучить сообщение */
	announce: (message: string) => void
	/** Показать ошибку импорта */
	fail: (message: string) => void
}

/** Общий контекст частей модели редактора */
export interface EditorContext {
	/** Документ и история */
	doc: EditorDocumentApi
	/** Слой и выделение */
	selection: EditorSelectionApi
	/** Сообщения */
	announcer: EditorAnnouncer
	/** Сцена холста: по ней указатель переводится в доли картинки */
	getStage: () => HTMLElement | null
	/** Редактор только для просмотра */
	isDisabled: () => boolean
}

/** Размер картинки или SVG в её единицах */
export interface ImageSize {
	/** Ширина */
	width: number
	/** Высота */
	height: number
}

/** Элемент SVG слоя, из которого можно сделать объект `svg` */
export interface SvgCandidate {
	/** Id элемента в SVG */
	elementId: string
	/** Название: `<title>` элемента или его id */
	title: string
}

/** Вид поля панели свойств */
type EditorFieldKind = 'text' | 'textarea' | 'select' | 'number' | 'switch' | 'tags'

/** Вариант выпадающего поля */
export interface EditorFieldOption {
	/** Значение; пустая строка — «не задано» */
	value: string
	/** Подпись */
	label: string
}

/** Поле панели свойств */
export interface EditorField {
	/** Ключ поля: имя свойства объекта, `geo.x`, `style.fill` */
	key: string
	/** Вид поля */
	kind: EditorFieldKind
	/** Подпись */
	label: string
	/** Значение */
	value: string | number | boolean | string[] | null
	/** Варианты выпадающего поля */
	options?: EditorFieldOption[]
	/** Наименьшее число */
	min?: number
	/** Наибольшее число */
	max?: number
	/** Знаков после запятой у числа; по умолчанию 2 */
	precision?: number
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Ошибка поля */
	error?: string
}

/** Раздел панели свойств */
export interface EditorFieldSection {
	/** Id раздела */
	id: string
	/** Заголовок */
	title: string
	/** Поля */
	fields: EditorField[]
}

/** Значение поля панели свойств */
export type EditorFieldValue = EditorField['value']

/** Черновик многоугольника и его команды */
interface EditorPolygonApi {
	/** Поставленные вершины */
	points: Ref<[number, number][]>
	/** Добавить вершину; рядом с первой — завершить фигуру */
	add: (point: EditorPoint) => void
	/** Завершить фигуру; `false` — меньше трёх вершин */
	finish: () => boolean
	/** Убрать последнюю вершину */
	removeLast: () => void
}

/** Инструмент и рисование */
export interface EditorToolApi {
	/** Текущий инструмент */
	tool: Ref<ImageMapEditorTool>
	/** Протяжка указателем */
	drag: ShallowRef<EditorDrag | null>
	/** Первый угол прямоугольника или эллипса, поставленный с клавиатуры; `cancel` сбрасывает */
	keyStart: Ref<EditorPoint | null>
	/** Многоугольник в процессе рисования */
	polygon: EditorPolygonApi
	/** Сменить инструмент */
	setTool: (value: ImageMapEditorTool) => void
	/** Сбросить рисование */
	cancel: () => void
	/** Создать точку или фигуру по двум точкам */
	finishDraw: (start: EditorPoint, end: EditorPoint) => void
}

/** Команды правки для клавиатуры и панели инструментов */
export interface EditorCommands {
	/** Отменить */
	undo: () => boolean
	/** Повторить */
	redo: () => boolean
	/** Удалить выделенный объект */
	deleteSelected: () => void
	/** Дублировать выделенный объект */
	duplicate: () => void
}

/** Что холст берёт у указателя и клавиатуры */
export interface EditorCanvasOptions {
	/** Контейнер разметки SVG слоя */
	svgContainerRef: Ref<HTMLElement | null>
	/** Точка под указателем */
	getHover: () => EditorPoint | null
	/** Первый угол фигуры, поставленный с клавиатуры */
	getKeyStart: () => EditorPoint | null
	/** Клавиатурное перекрестие */
	getCursor: () => EditorPoint
}

/** Что работе с файлами нужно от редактора */
export interface EditorFilesOptions {
	/** Заменить карту целиком одним шагом истории */
	replaceData: (data: ImageMapData) => void
	/** Показать слой */
	setLayer: (id: string) => void
	/** Имя файла экспорта */
	getFileName: () => string
	/** Контейнер разметки SVG слоя */
	svgContainerRef: Ref<HTMLElement | null>
	/** Приставка id элементов SVG на холсте */
	svgPrefix: string
}

/** Связь выделения и слоя с v-model:selected и показанным слоем */
export interface EditorSelectionSync {
	/** Карта */
	data: Ref<ImageMapData>
	/** id выделенного объекта */
	selectedId: Ref<string | null>
	/** Показанный слой */
	currentLayer: ComputedRef<ImageMapLayer | undefined>
	/** Сменить слой (эмитит update:layer) */
	setLayer: (id: string) => void
	/** Выделить объект (эмитит update:selected) */
	select: (id: string | null) => void
}
