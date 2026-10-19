import type { ComputedRef } from 'vue'
import type { FlowLayoutOptions } from '../core/flowCommandInternal.types'
import type { FlowCommandResult, FlowRejectEvent } from '../../api/flowController.types'
import type { FlowEdge, FlowGroup, FlowNode, FlowPoint, FlowRect } from '../../data/flowData.types'
import type { FlowEditAlign, FlowEditEnd, FlowEditGuide, FlowEditNotice, FlowEditEnv, FlowEditView } from './flowEdit.types'

/** Что привязка берёт на вход */
export interface FlowSnapInput {
	/** Рамки перетаскиваемых узлов до сдвига */
	moving: readonly FlowRect[]
	/** Рамки остальных узлов */
	others: readonly FlowRect[]
	/** Сдвиг указателя в px холста */
	delta: FlowPoint
	/** Шаг сетки */
	grid: number
	/** Допуск направляющих в px холста */
	tolerance: number
	/** Привязка к сетке */
	isGrid: boolean
	/** Привязка к направляющим */
	isGuides: boolean
}

/** Итог привязки */
export interface FlowSnapResult {
	/** Сдвиг после привязки */
	delta: FlowPoint
	/** Направляющие */
	guides: FlowEditGuide[]
}

/** Узел с рамкой — вход выравнивания */
export interface FlowAlignItem {
	/** Id */
	id: string
	/** Рамка */
	rect: FlowRect
}

/** Вставленные элементы с новыми id */
export interface FlowPasted {
	/** Узлы */
	nodes: FlowNode[]
	/** Связи */
	edges: FlowEdge[]
	/** Группы */
	groups: FlowGroup[]
}

/** Команды пользователя: команды ядра с источником `user` */
export interface FlowEditCommands {
	/** Добавить узел */
	addNode: (node: FlowNode) => Promise<FlowCommandResult>
	/** Добавить группу */
	addGroup: (group: FlowGroup) => Promise<FlowCommandResult>
	/** Добавить связь */
	addEdge: (edge: FlowEdge) => Promise<FlowCommandResult>
	/** Соединить */
	connect: (ends: [FlowEditEnd, FlowEditEnd], edge?: Partial<FlowEdge>) => Promise<FlowCommandResult>
	/** Изменить поля элемента */
	update: (target: { entity: 'node' | 'edge' | 'group'; id: string }, patch: Record<string, unknown>) => Promise<FlowCommandResult>
	/** Изменить поля карты */
	updateMap: (patch: Record<string, unknown>) => Promise<FlowCommandResult>
	/** Удалить */
	remove: (ids: string[]) => Promise<FlowCommandResult>
	/** Переместить */
	move: (ids: string[], by: FlowPoint | Record<string, FlowPoint>) => Promise<FlowCommandResult>
	/** Разложить */
	layout: (options?: FlowLayoutOptions) => Promise<FlowCommandResult>
	/** Проверить соединение без изменения данных */
	verify: (ends: [FlowEditEnd, FlowEditEnd], kind?: string) => FlowRejectEvent | null
}

/** Действия «Правки» */
export interface FlowEditActions {
	/** Удалить выделенное */
	removeSelection: () => Promise<void>
	/** Сдвинуть выделенные узлы */
	nudge: (delta: FlowPoint) => Promise<void>
	/** Копировать */
	copy: () => Promise<void>
	/** Вырезать */
	cut: () => Promise<void>
	/** Вставить */
	paste: () => Promise<void>
	/** Дублировать */
	duplicate: () => Promise<void>
	/** Отменить */
	undo: () => void
	/** Повторить */
	redo: () => void
	/** Выровнять */
	align: (mode: FlowEditAlign) => Promise<void>
	/** Распределить */
	distribute: (axis: 'x' | 'y') => Promise<void>
	/** Выделенное — в новую группу */
	groupSelection: () => Promise<void>
	/** Выделить всё */
	selectAll: () => void
	/** Снять выделение */
	clearSelection: () => void
	/** Разложить */
	arrange: (options?: FlowLayoutOptions) => Promise<void>
}

/** Уведомление из частей «Правки» */
export type FlowEditNotify = (type: FlowEditNotice['type'], text: string) => void

/** Всё, что нужно инструментам и клавишам */
export interface FlowEditContext {
	/** Среда */
	env: FlowEditEnv
	/** Команды */
	commands: FlowEditCommands
	/** Действия */
	actions: FlowEditActions
	/** Уведомление */
	notify: FlowEditNotify
	/** Пересчёт экрана в холст */
	view: () => FlowEditView
	/** Следующий щелчок гасится: он завершает перетаскивание */
	flags: { isClickSuppressed: boolean }
}

/** Что нужно действиям: среда, команды и уведомления */
export interface FlowEditActionContext {
	/** Среда */
	env: FlowEditEnv
	/** Команды */
	commands: FlowEditCommands
	/** Уведомление */
	notify: FlowEditNotify
}

/** Ось привязки */
export type FlowSnapAxis = 'x' | 'y'

/** Совпадение края или центра с соседом */
export interface FlowSnapMatch {
	/** Сдвиг до совпадения */
	shift: number
	/** Линия совпадения */
	at: number
	/** Совпали центры */
	isCenter: boolean
}

/** Обработчики слежения за указателем */
export interface FlowEditTrack {
	/** Указатель сдвинулся дальше порога */
	onStart?: (event: PointerEvent) => void
	/** Движение после порога */
	onMove: (event: PointerEvent) => void
	/** Отпускание или отмена; `isMoved` — перетаскивание началось */
	onEnd: (event: PointerEvent, isMoved: boolean) => void
}

/** Порт на узле для показа и соединения */
export interface FlowEditPort {
	/** Id порта; у порта по умолчанию — пустая строка */
	id: string
	/** Сторона */
	side: 'top' | 'right' | 'bottom' | 'left' | 'auto'
	/** Точка, px холста */
	point: { x: number; y: number }
	/** Подпись */
	label?: string
}

/** Таблица клавиш: сочетание → действие */
export type FlowEditKeys = Record<string, (event: KeyboardEvent) => void>

/** «Правка» модели: состояние и всё, что нужно частям интерфейса */
export interface FlowEditing {
	/** Контекст инструментов */
	context: FlowEditContext
	/** Время последнего сохранения черновика (проп `savedAt`) */
	savedAt: () => Date | string | number | undefined
	/** Палитра показана: режим edit и не компактный вид */
	hasPalette: ComputedRef<boolean>
}

/** Порт на слое холста */
export interface FlowEditLayerPort extends FlowEditPort {
	/** Ключ для `v-for` */
	key: string
	/** Узел */
	node: string
}

/** Тип поля панели свойств */
type FlowEditFieldType = 'text' | 'area' | 'number' | 'select' | 'switch' | 'segmented' | 'color'

/** Вариант выбора поля */
export interface FlowEditFieldOption {
	/** Значение */
	value: string
	/** Подпись */
	label: string
}

/** Поле панели свойств: значение, вид и запись через команду */
export interface FlowEditFieldDef {
	/** Ключ */
	id: string
	/** Вид поля */
	type: FlowEditFieldType
	/** Подпись */
	label: string
	/** Значение */
	value: string | number | boolean | null | undefined
	/** Варианты */
	options?: FlowEditFieldOption[]
	/** Поле недоступно */
	isDisabled?: boolean
	/** Записать значение */
	commit: (value: string | number | boolean | null) => void
}

/** Что показывает панель свойств: карта, элемент или несколько элементов */
export type FlowEditSubject = { type: 'map' } | { type: 'many'; ids: string[] } | { type: 'node' | 'edge' | 'group'; id: string }
